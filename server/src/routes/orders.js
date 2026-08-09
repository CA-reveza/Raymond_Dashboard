import { Router } from "express";
import { getCustomer, saveCustomer, saveOrder, listOrders } from "../db.js";
import { calculateVipTier, cleanCode, shortId, nowIso } from "../lib/helpers.js";
import { redeemCoupon } from "./redemptions.js";
import { userIdFromPhone } from "./customers.js";

const router = Router();

router.post("/api/order", async (req, res) => {
  const body = req.body || {};
  const user = body.user || {};
  const name = user.name || body.customerName || "Shoppers Stop Guest";
  const phone = user.phone || body.customerPhone || "+91 98201 00000";
  const email = user.email || body.customerEmail || "guest@shoppersstop.com";
  const items = body.items || [];
  const total =
    body.finalTotal ||
    body.totalAmount ||
    items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0) ||
    2499;
  const couponCode = cleanCode(body.couponCode || body.coupon);
  const discountSaved = body.discountSaved ?? (couponCode ? total * 0.15 : 0);
  const storeLocation = body.storeLocation || "Mumbai - Malad West Flagship";

  const userId = userIdFromPhone(phone);
  const existing = await getCustomer(userId);
  const newSpend = (existing?.total_spend || 0) + total;
  const customer = {
    user_id: userId,
    name,
    email,
    phone,
    total_spend: newSpend,
    vip_tier: calculateVipTier(newSpend),
    points: (existing?.points || 0) + Math.floor(total * 0.1),
    created_at: existing?.created_at || nowIso(),
  };
  await saveCustomer(customer);

  const orderId = body.orderId || shortId("SS-ORD");
  const order = {
    id: orderId,
    order_id: orderId,
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    items,
    total_amount: total,
    coupon_code: couponCode,
    discount_saved: discountSaved,
    status: "Completed",
    order_date: nowIso(),
    store_location: storeLocation,
    channel: body.channel || "Online",
  };
  await saveOrder(order);

  let redemption = null;
  if (couponCode) {
    redemption = await redeemCoupon({
      code: couponCode,
      name,
      email,
      phone,
      orderTotal: total,
      discountSaved,
      storeLocation,
    });
  }

  res.json({ status: "ok", order_id: orderId, order, customer, redemption });
});

router.get("/api/orders", async (req, res) => {
  res.json({ success: true, orders: await listOrders() });
});

export default router;
