import { Router } from "express";
import { getCoupon, incrementCouponUsage, saveRedemption, listRedemptions } from "../db.js";
import { cleanCode, shortId, nowIso } from "../lib/helpers.js";

const router = Router();

const DEFAULT_STORE_LOCATION = "Mumbai - Malad West Flagship";

// Shared by the checkin flow and the direct /api/redemptions endpoint.
export async function redeemCoupon({ code, name, email, phone, orderTotal, discountSaved, storeLocation }) {
  const clean = cleanCode(code);
  const coupon = (await getCoupon(clean)) || { code: clean, discount_value: 20, min_order_value: 4999 };

  const redemption = {
    id: shortId("RED"),
    coupon_code: clean,
    customer_name: name || "Wi-Fi Shopper",
    customer_email: email || "",
    customer_phone: phone || "",
    loyalty_tier: "Gold First Citizen",
    order_id: shortId("SS-ORD", 5),
    order_total: orderTotal ?? coupon.min_order_value ?? 4999,
    discount_saved: discountSaved ?? coupon.discount_value ?? 1000,
    redeemed_at: nowIso(),
    store_location: storeLocation || DEFAULT_STORE_LOCATION,
  };

  await saveRedemption(redemption);
  await incrementCouponUsage(clean, redemption.customer_name);

  return redemption;
}

router.post("/api/redemptions", async (req, res) => {
  const body = req.body || {};
  const redemption = await redeemCoupon({
    code: body.couponCode || body.code,
    name: body.customerName,
    email: body.customerEmail,
    phone: body.customerPhone,
    orderTotal: body.orderTotal,
    discountSaved: body.discountSaved,
    storeLocation: body.storeLocation,
  });
  res.json({ success: true, status: "ok", redemption });
});

router.get("/api/redemptions", async (req, res) => {
  res.json({ success: true, redemptions: await listRedemptions() });
});

export default router;
