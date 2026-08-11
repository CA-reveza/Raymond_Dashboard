import { Router } from "express";
import { marketplaceDb, marketplaceReady } from "../marketplaceSupabase.js";

const router = Router();

// ---------------------------------------------------------------------------
// Confirmed schema (verified directly against the Axionik MarketplacePro
// Supabase project's public schema on 2026-08-11). None of these tables have
// declared FK constraints we've confirmed exist, so we do explicit two-step
// lookups (fetch ids, then batch-fetch related rows) rather than PostgREST's
// embedded-resource syntax.
//
// orders:    id, customer_id, items (jsonb), num_items, base_amount,
//            discount_id, discount_amount, final_amount, status,
//            shipping_address (jsonb), source, source_client,
//            payment_provider, payment_link_id, payment_link_url,
//            payment_ref, hold_expires_at, created_at, confirmed_at
// customers: id, email, full_name, phone, default_address (jsonb), created_at
// products:  id, category_id, brand, name, color, pattern, fit, fabric, sku,
//            price, mrp, discount_percent, image_url, product_url,
//            is_active, created_at
//
// NOTE: There is no `stores` table in this project, so `source_client` is
// used in its place to show where the order originated from. This file only
// handles retail orders. Movie bookings and restaurant reservations were
// removed since only retail order data is required.
// ---------------------------------------------------------------------------

const RECENT_LIMIT = 100; // cap for the "all customers" activity feed

async function getCustomerIdByEmail(email) {
  const { data, error } = await marketplaceDb
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

async function lookupById(table, ids, columns) {
  if (!ids.length) return new Map();
  const { data, error } = await marketplaceDb.from(table).select(columns).in("id", [...new Set(ids)]);
  if (error) throw error;
  return new Map((data || []).map((row) => [row.id, row]));
}

async function withMarketplaceReady(fn) {
  if (!marketplaceReady) return { rows: [], error: "Marketplace Supabase not configured" };
  try {
    return { rows: await fn(), error: null };
  } catch (err) {
    return { rows: [], error: err.message };
  }
}

// customerId === null means "across all customers" (used by the Connectors tab).
function applyCustomerFilter(query, customerId) {
  return customerId ? query.eq("customer_id", customerId) : query.limit(RECENT_LIMIT);
}

// ---------------------------------------------------------------------------
// Retail orders: orders -> customers + products (via items jsonb)
// ---------------------------------------------------------------------------
async function fetchRetailOrders(customerId) {
  return withMarketplaceReady(async () => {
    const { data: orders, error } = await applyCustomerFilter(
      marketplaceDb
        .from("orders")
        .select(
          "id, customer_id, items, num_items, base_amount, discount_amount, final_amount, status, source, source_client, payment_ref, created_at, confirmed_at"
        )
        .order("created_at", { ascending: false }),
      customerId
    );
    if (error) throw error;
    if (!orders?.length) return [];

    const productIds = orders.flatMap((o) => (o.items || []).map((li) => li.product_id)).filter(Boolean);

    const [products, customers] = await Promise.all([
      lookupById("products", productIds, "id, name, brand, price"),
      lookupById(
        "customers",
        orders.map((o) => o.customer_id),
        "id, full_name, email"
      ),
    ]);

    return orders.map((o) => {
      const customer = customers.get(o.customer_id);
      return {
        id: o.id,
        customer_name: customer?.full_name || "-",
        customer_email: customer?.email || "-",
        store: o.source_client || o.source || "-",
        items: (o.items || [])
          .map((li) => {
            const product = products.get(li.product_id);
            const label = product ? `${product.brand ? product.brand + " " : ""}${product.name}` : "Item";
            const size = li.size ? ` (${li.size})` : "";
            return `${li.quantity || 1}x ${label}${size}`;
          })
          .join(", "),
        amount: o.final_amount,
        discount: o.discount_amount,
        status: o.status,
        payment_ref: o.payment_ref || "-",
        created_at: o.created_at,
        confirmed_at: o.confirmed_at,
      };
    });
  });
}

async function buildActivity(customerId) {
  const retail = await fetchRetailOrders(customerId);
  return [{ key: "retail_orders", label: "Retail Orders", rows: retail.rows, error: retail.error }];
}

function notConfiguredResponse(extra = {}) {
  return {
    success: true,
    marketplace_ready: false,
    activity: [
      { key: "retail_orders", label: "Retail Orders", rows: [], error: "Marketplace Supabase not configured" },
    ],
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// GET /api/marketplace/activity/all -- powers the "Connectors" dashboard tab.
// Shows the most recent retail order activity across ALL Marketplace
// customers, not scoped to a single Raymonds shopper.
// ---------------------------------------------------------------------------
router.get("/api/marketplace/activity/all", async (req, res) => {
  if (!marketplaceReady) return res.json(notConfiguredResponse());
  const activity = await buildActivity(null);
  res.json({ success: true, marketplace_ready: true, activity });
});

// ---------------------------------------------------------------------------
// GET /api/marketplace/:email -- per-customer lookup, used by the customer
// detail modal in the Customers tab.
// ---------------------------------------------------------------------------
router.get("/api/marketplace/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, error: "email is required" });

  if (!marketplaceReady) return res.json(notConfiguredResponse({ email }));

  let customerId;
  try {
    customerId = await getCustomerIdByEmail(email);
  } catch (err) {
    return res.json({
      success: false,
      marketplace_ready: true,
      email,
      error: `Could not look up customer: ${err.message}`,
      activity: [],
    });
  }

  if (!customerId) {
    return res.json({
      success: true,
      marketplace_ready: true,
      email,
      activity: [{ key: "retail_orders", label: "Retail Orders", rows: [], error: null }],
      note: "No Marketplace account found for this email.",
    });
  }

  const activity = await buildActivity(customerId);
  res.json({ success: true, marketplace_ready: true, email, activity });
});

export default router;
