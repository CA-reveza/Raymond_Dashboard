export const STORE_ID = "store_shoppers_stop";

export const STORE = {
  store_id: STORE_ID,
  name: "SHOPPERS STOP Flagship",
  offers: [
    "TODAY ONLY: 20% OFF Welcome Voucher!",
    "EXCLUSIVE: Free Gift Voucher on purchases over ₹4,999!",
  ],
};

const ACTIVE_COUPON_CODES = [
  "FESTIVE20",
  "FIRSTCITIZEN15",
  "BEAUTYBUY2",
  "ENDOFSEASON50",
];

export function randomCouponCode() {
  return ACTIVE_COUPON_CODES[Math.floor(Math.random() * ACTIVE_COUPON_CODES.length)];
}

export function calculateVipTier(spend) {
  if (spend >= 20000) return "Platinum";
  if (spend >= 10000) return "Gold";
  if (spend >= 3000) return "Silver";
  return "Bronze";
}

export function cleanCode(code) {
  return String(code || "").replace(/\s+/g, "").toUpperCase();
}

export function shortId(prefix, len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

export function nowIso() {
  return new Date().toISOString();
}
