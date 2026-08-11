import { Router } from "express";
import { marketplaceDb, marketplaceReady } from "../marketplaceSupabase.js";

const router = Router();

// ---------------------------------------------------------------------------
// Confirmed schema (docs/marketplace_movies_schema.sql +
// docs/marketplace_full_schema.txt). None of these tables have a direct
// `email` column -- everything hangs off app_users via user_id. We do
// explicit two-step lookups (fetch ids, then batch-fetch related rows)
// rather than PostgREST's embedded-resource syntax, since that requires
// declared FK constraints we haven't confirmed exist.
//
// NOTE: This file only handles retail orders. Movie bookings and restaurant
// reservations were removed since only retail order data is required.
// ---------------------------------------------------------------------------

const RECENT_LIMIT = 100; // cap for the "all customers" activity feed

async function getUserIdByEmail(email) {
  const { data, error } = await marketplaceDb
    .from("app_users")
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

// userId === null means "across all customers" (used by the Connectors tab).
function applyUserFilter(query, userId) {
  return userId ? query.eq("user_id", userId) : query.limit(RECENT_LIMIT);
}

// ---------------------------------------------------------------------------
// Retail orders: retail_orders -> app_users + stores
// ---------------------------------------------------------------------------
async function fetchRetailOrders(userId) {
  return withMarketplaceReady(async () => {
    const { data: orders, error } = await applyUserFilter(
      marketplaceDb
        .from("retail_orders")
        .select(
          "id, user_id, store_id, line_items, base_amount, discount_amount, final_amount, status, source, payment_ref, created_at, confirmed_at"
        )
        .order("created_at", { ascending: false }),
      userId
    );
    if (error) throw error;
    if (!orders?.length) return [];

    const [stores, customers] = await Promise.all([
      lookupById(
        "stores",
        orders.map((o) => o.store_id),
        "id, brand_name"
      ),
      lookupById(
        "app_users",
        orders.map((o) => o.user_id),
        "id, full_name, email"
      ),
    ]);

    return orders.map((o) => {
      const customer = customers.get(o.user_id);
      return {
        id: o.id,
        customer_name: customer?.full_name || "-",
        customer_email: customer?.email || "-",
        store: stores.get(o.store_id)?.brand_name || "-",
        items: (o.line_items || []).map((li) => `${li.qty}x @Rs${li.unit_price}`).join(", "),
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

async function buildActivity(userId) {
  const retail = await fetchRetailOrders(userId);
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

  let userId;
  try {
    userId = await getUserIdByEmail(email);
  } catch (err) {
    return res.json({
      success: false,
      marketplace_ready: true,
      email,
      error: `Could not look up customer: ${err.message}`,
      activity: [],
    });
  }

  if (!userId) {
    return res.json({
      success: true,
      marketplace_ready: true,
      email,
      activity: [{ key: "retail_orders", label: "Retail Orders", rows: [], error: null }],
      note: "No Marketplace account found for this email.",
    });
  }

  const activity = await buildActivity(userId);
  res.json({ success: true, marketplace_ready: true, email, activity });
});

export default router;
