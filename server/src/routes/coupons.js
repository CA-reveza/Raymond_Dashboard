import { Router } from "express";
import { listCoupons, saveCoupon, listRedemptions } from "../db.js";
import { cleanCode } from "../lib/helpers.js";

const router = Router();

const SEED_COUPONS = [
  {
    code: "FESTIVE20",
    title: "Festive Discount",
    description: "Flat 20% off on all Ethnic & Designer Collections for First Citizen Members",
    discount_type: "Percentage",
    discount_value: 20,
    min_order_value: 4999,
    usage_count: 0,
    max_usage: 5000,
    status: "Active",
    start_date: "2026-07-01",
    end_date: "2026-08-15",
    applicable_category: "Ethnic & Womenswear",
  },
  {
    code: "FIRSTCITIZEN15",
    title: "First Citizen Bonus",
    description: "Exclusive 15% bonus discount for Black & Platinum tier members",
    discount_type: "Percentage",
    discount_value: 15,
    min_order_value: 2999,
    usage_count: 0,
    max_usage: 10000,
    status: "Active",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    applicable_category: "Site-wide",
  },
  {
    code: "BEAUTYBUY2",
    title: "Beauty Offer",
    description: "Buy Beauty & Fragrance items above ₹5000 and get ₹1000 Instant Off",
    discount_type: "Flat Amount",
    discount_value: 1000,
    min_order_value: 5000,
    usage_count: 0,
    max_usage: 2500,
    status: "Active",
    start_date: "2026-07-10",
    end_date: "2026-08-01",
    applicable_category: "Beauty & Perfumes",
  },
  {
    code: "ENDOFSEASON50",
    title: "End of Season",
    description: "End of Season Sale - scheduled clearance for select Menswear lines",
    discount_type: "Percentage",
    discount_value: 50,
    min_order_value: 9999,
    usage_count: 0,
    max_usage: 1000,
    status: "Scheduled",
    start_date: "2026-08-05",
    end_date: "2026-08-20",
    applicable_category: "Menswear",
  },
];

let seeded = false;
async function ensureSeedCoupons() {
  if (seeded) return;
  seeded = true;
  const existing = await listCoupons();
  const existingCodes = new Set(existing.map((c) => c.code));
  for (const coupon of SEED_COUPONS) {
    if (!existingCodes.has(coupon.code)) await saveCoupon(coupon);
  }
}

router.get("/api/coupons", async (req, res) => {
  await ensureSeedCoupons();
  const coupons = await listCoupons();
  const redemptions = await listRedemptions();

  const withRedemptions = coupons.map((coupon) => ({
    ...coupon,
    redemptions: redemptions.filter((r) => r.coupon_code === cleanCode(coupon.code)),
  }));

  res.json({ success: true, coupons: withRedemptions });
});

router.post("/api/coupons", async (req, res) => {
  const body = req.body || {};
  const coupon = {
    code: cleanCode(body.code),
    title: body.title || "Special Offer",
    description: body.description || "",
    discount_type: body.discountType || "Percentage",
    discount_value: body.discountValue ?? 10,
    min_order_value: body.minOrderValue ?? 1000,
    usage_count: 0,
    max_usage: body.maxUsage ?? 5000,
    status: "Active",
    start_date: body.startDate || null,
    end_date: body.endDate || null,
    applicable_category: body.applicableCategory || "Site-wide",
  };
  await saveCoupon(coupon);
  res.json({ success: true, coupon });
});

export default router;
