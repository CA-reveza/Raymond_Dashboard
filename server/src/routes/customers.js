import { Router } from "express";
import { getCustomer, saveCustomer, listCustomers, saveVisit, listVisits } from "../db.js";
import { STORE, randomCouponCode, nowIso } from "../lib/helpers.js";
import { redeemCoupon } from "./redemptions.js";

const router = Router();

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function userIdFromPhone(phone) {
  return `cust_${normalizePhone(phone)}`;
}

// Wi-Fi captive portal check-in — creates/updates a customer profile,
// verifies + redeems a coupon, and logs a visit.
router.post("/api/customers", async (req, res) => {
  const body = req.body || {};
  const name = body.name || body.username || "Wi-Fi Guest";
  const phone = body.phone || body.phnumber || "+91 98201 00000";
  const email = body.email || `${phone}@ss-wifi.in`;
  const rawCoupon = (body.coupon || body.couponCode || body.coupon_code || body.sessionVoucherCode || "")
    .toString()
    .replace(/\s+/g, "")
    .toUpperCase();
  const couponCode = rawCoupon || randomCouponCode();
  const userId = userIdFromPhone(phone);

  const redemption = await redeemCoupon({ code: couponCode, name, email, phone });

  const existing = await getCustomer(userId);
  const customer = existing
    ? { ...existing, name, email: email || existing.email, assigned_coupon: couponCode, last_visit: nowIso() }
    : {
        user_id: userId,
        name,
        email,
        phone,
        vip_tier: "Gold",
        total_spend: 0,
        points: 500,
        assigned_coupon: couponCode,
        created_at: nowIso(),
        last_visit: nowIso(),
      };

  await saveCustomer(customer);
  saveVisit({
    user_id: userId,
    customer_name: name,
    customer_phone: phone,
    store_id: STORE.store_id,
    store_name: STORE.name,
    platform: "web",
    timestamp: nowIso(),
  });

  res.json({ success: true, status: "ok", customer, redemption });
});

router.get("/api/customers", async (req, res) => {
  res.json({ success: true, customers: await listCustomers() });
});

router.get("/api/activity", (req, res) => {
  res.json({ success: true, visits: listVisits() });
});

export default router;
