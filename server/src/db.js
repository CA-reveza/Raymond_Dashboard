import { supabase, supabaseReady } from "./supabase.js";

// In-memory fallback so the API still works locally with zero setup.
const memory = {
  customers: new Map(), // user_id -> row
  visits: [],
  coupons: new Map(), // code -> row
  redemptions: [],
  orders: new Map(), // id -> row
  feedback: [],
};

async function safeSupabase(fn, fallback) {
  if (!supabaseReady) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error("Supabase error:", err.message);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function saveCustomer(customer) {
  memory.customers.set(customer.user_id, customer);
  await safeSupabase(
    () => supabase.from("customers").upsert({ id: customer.user_id, ...customer }),
    null
  );
  return customer;
}

export async function getCustomer(userId) {
  if (memory.customers.has(userId)) return memory.customers.get(userId);
  const row = await safeSupabase(async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  }, null);
  return row;
}

export async function listCustomers() {
  const supaRows = await safeSupabase(async () => {
    const { data } = await supabase.from("customers").select("*");
    return data || [];
  }, []);
  const merged = [...memory.customers.values()];
  for (const row of supaRows) {
    if (!merged.some((c) => c.user_id === row.user_id)) merged.push(row);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Visits
// ---------------------------------------------------------------------------

export function saveVisit(visit) {
  memory.visits.unshift(visit);
  return visit;
}

export function listVisits() {
  return memory.visits;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export async function saveCoupon(coupon) {
  memory.coupons.set(coupon.code, coupon);
  await safeSupabase(
    () => supabase.from("coupons").upsert({ id: coupon.code, ...coupon }),
    null
  );
  return coupon;
}

export async function getCoupon(code) {
  if (memory.coupons.has(code)) return memory.coupons.get(code);
  return safeSupabase(async () => {
    const { data } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
    return data;
  }, null);
}

export async function listCoupons() {
  const supaRows = await safeSupabase(async () => {
    const { data } = await supabase.from("coupons").select("*");
    return data || [];
  }, []);
  const merged = [...memory.coupons.values()];
  for (const row of supaRows) {
    if (!merged.some((c) => c.code === row.code)) merged.push(row);
  }
  return merged;
}

export async function incrementCouponUsage(code, customerName) {
  const coupon = await getCoupon(code);
  if (!coupon) return null;
  const names = coupon.redeemed_customers || "";
  const newNames = names.includes(customerName) ? names : [names, customerName].filter(Boolean).join(", ");
  const updated = {
    ...coupon,
    usage_count: (coupon.usage_count || 0) + 1,
    redeemed_customers: newNames,
  };
  await saveCoupon(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Redemptions
// ---------------------------------------------------------------------------

export async function saveRedemption(redemption) {
  memory.redemptions.unshift(redemption);
  await safeSupabase(() => supabase.from("redemptions").upsert(redemption), null);
  return redemption;
}

export async function listRedemptions() {
  const supaRows = await safeSupabase(async () => {
    const { data } = await supabase.from("redemptions").select("*");
    return data || [];
  }, []);
  const merged = [...memory.redemptions];
  for (const row of supaRows) {
    if (!merged.some((r) => r.id === row.id)) merged.push(row);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function saveOrder(order) {
  memory.orders.set(order.id, order);
  await safeSupabase(() => supabase.from("orders").upsert({ id: order.id, ...order }), null);
  return order;
}

export async function listOrders() {
  const supaRows = await safeSupabase(async () => {
    const { data } = await supabase.from("orders").select("*").order("order_date", { ascending: false }).limit(50);
    return data || [];
  }, []);
  const merged = [...memory.orders.values()];
  for (const row of supaRows) {
    if (!merged.some((o) => o.id === row.id)) merged.push(row);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export async function saveFeedback(feedback) {
  memory.feedback.unshift(feedback);
  await safeSupabase(() => supabase.from("feedbacks").upsert(feedback), null);
  return feedback;
}

export async function listFeedback() {
  const supaRows = await safeSupabase(async () => {
    const { data } = await supabase.from("feedbacks").select("*");
    return data || [];
  }, []);
  const merged = [...memory.feedback];
  for (const row of supaRows) {
    if (!merged.some((f) => f.id === row.id)) merged.push(row);
  }
  return merged;
}
