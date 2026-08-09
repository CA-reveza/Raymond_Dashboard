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
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Movie bookings: bookings -> shows -> movies + theatres
// ---------------------------------------------------------------------------
async function fetchMovieBookings(userId) {
  return withMarketplaceReady(async () => {
    const { data: bookings, error } = await marketplaceDb
      .from("bookings")
      .select(
        "id, show_id, num_seats, base_amount, discount_amount, final_amount, status, source, created_at, confirmed_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!bookings?.length) return [];

    const shows = await lookupById(
      "shows",
      bookings.map((b) => b.show_id),
      "id, movie_id, theatre_id, show_date, show_time"
    );
    const movieIds = [...shows.values()].map((s) => s.movie_id);
    const theatreIds = [...shows.values()].map((s) => s.theatre_id);
    const movies = await lookupById("movies", movieIds, "id, title");
    const theatres = await lookupById("theatres", theatreIds, "id, name");

    return bookings.map((b) => {
      const show = shows.get(b.show_id);
      return {
        id: b.id,
        movie: show ? movies.get(show.movie_id)?.title || "-" : "-",
        theatre: show ? theatres.get(show.theatre_id)?.name || "-" : "-",
        show_date: show?.show_date || "-",
        show_time: show?.show_time || "-",
        seats: b.num_seats,
        amount: b.final_amount,
        status: b.status,
        booked_via: b.source,
        confirmed_at: b.confirmed_at,
      };
    });
  });
}

// ---------------------------------------------------------------------------
// Retail orders: retail_orders -> stores
// ---------------------------------------------------------------------------
async function fetchRetailOrders(userId) {
  return withMarketplaceReady(async () => {
    const { data: orders, error } = await marketplaceDb
      .from("retail_orders")
      .select(
        "id, store_id, line_items, base_amount, discount_amount, final_amount, status, source, payment_ref, created_at, confirmed_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!orders?.length) return [];

    const stores = await lookupById(
      "stores",
      orders.map((o) => o.store_id),
      "id, brand_name"
    );

    return orders.map((o) => ({
      id: o.id,
      store: stores.get(o.store_id)?.brand_name || "-",
      items: (o.line_items || []).map((li) => `${li.qty}x @Rs${li.unit_price}`).join(", "),
      amount: o.final_amount,
      discount: o.discount_amount,
      status: o.status,
      payment_ref: o.payment_ref || "-",
      confirmed_at: o.confirmed_at,
    }));
  });
}

// ---------------------------------------------------------------------------
// Restaurant reservations: reservations -> restaurants + table_slots
// ---------------------------------------------------------------------------
async function fetchRestaurantReservations(userId) {
  return withMarketplaceReady(async () => {
    const { data: reservations, error } = await marketplaceDb
      .from("reservations")
      .select(
        "id, restaurant_id, table_slot_id, party_size, pre_ordered_items, base_amount, discount_amount, final_amount, status, source, payment_ref, created_at, confirmed_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!reservations?.length) return [];

    const restaurants = await lookupById(
      "restaurants",
      reservations.map((r) => r.restaurant_id),
      "id, name"
    );
    const slots = await lookupById(
      "table_slots",
      reservations.map((r) => r.table_slot_id),
      "id, slot_date, slot_time"
    );

    return reservations.map((r) => {
      const slot = slots.get(r.table_slot_id);
      return {
        id: r.id,
        restaurant: restaurants.get(r.restaurant_id)?.name || "-",
        date: slot?.slot_date || "-",
        time: slot?.slot_time || "-",
        party_size: r.party_size,
        pre_ordered: (r.pre_ordered_items || []).length
          ? `${(r.pre_ordered_items || []).length} item(s) pre-ordered`
          : "-",
        amount: r.final_amount,
        status: r.status,
        payment_ref: r.payment_ref || "-",
        confirmed_at: r.confirmed_at,
      };
    });
  });
}

router.get("/api/marketplace/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, error: "email is required" });

  if (!marketplaceReady) {
    return res.json({
      success: true,
      marketplace_ready: false,
      email,
      activity: [
        { key: "movie_bookings", label: "Movie Bookings", rows: [], error: "Marketplace Supabase not configured" },
        { key: "retail_orders", label: "Retail Orders", rows: [], error: "Marketplace Supabase not configured" },
        {
          key: "restaurant_reservations",
          label: "Restaurant Reservations",
          rows: [],
          error: "Marketplace Supabase not configured",
        },
      ],
    });
  }

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
      activity: [
        { key: "movie_bookings", label: "Movie Bookings", rows: [], error: null },
        { key: "retail_orders", label: "Retail Orders", rows: [], error: null },
        { key: "restaurant_reservations", label: "Restaurant Reservations", rows: [], error: null },
      ],
      note: "No Marketplace account found for this email.",
    });
  }

  const [movies, retail, reservations] = await Promise.all([
    fetchMovieBookings(userId),
    fetchRetailOrders(userId),
    fetchRestaurantReservations(userId),
  ]);

  res.json({
    success: true,
    marketplace_ready: true,
    email,
    activity: [
      { key: "movie_bookings", label: "Movie Bookings", rows: movies.rows, error: movies.error },
      { key: "retail_orders", label: "Retail Orders", rows: retail.rows, error: retail.error },
      {
        key: "restaurant_reservations",
        label: "Restaurant Reservations",
        rows: reservations.rows,
        error: reservations.error,
      },
    ],
  });
});

export default router;
