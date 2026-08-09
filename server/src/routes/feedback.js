import { Router } from "express";
import { saveFeedback, listFeedback } from "../db.js";
import { shortId } from "../lib/helpers.js";

const router = Router();

function normalizeSentiment(raw) {
  const val = String(raw || "").toLowerCase();
  if (["liked", "like", "up", "positive", "5"].includes(val)) return "Liked";
  if (["disliked", "dislike", "down", "negative", "1"].includes(val)) return "Disliked";
  return "Liked";
}

router.post("/api/feedback", async (req, res) => {
  const body = req.body || {};
  const name = body.name || body.customerName || "Wi-Fi Guest";
  const phone = body.phone || body.customerPhone || "+91 98201 00000";
  const email = body.email || body.customerEmail || `${Date.now()}@shoppersstop.com`;
  const text = (body.feedback || body.comment || "").trim();
  const sentiment = normalizeSentiment(body.sentiment || body.rating);
  const now = new Date();

  const record = {
    id: shortId("FB"),
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    loyalty_tier: "Gold First Citizen",
    store_location: body.storeLocation || "Mumbai - Malad West Flagship",
    category: body.category || "Captive Portal Feedback",
    rating: sentiment === "Liked" ? 5 : 1,
    title: `Wi-Fi Guest Feedback (${sentiment})`,
    comment: text || `${sentiment} the store experience`,
    date: now.toISOString().slice(0, 10),
    time: now.toLocaleTimeString(),
    sentiment,
    verified_purchase: true,
    helpful_count: 1,
    manager_response: "",
  };

  await saveFeedback(record);
  res.json({ success: true, feedback: record });
});

router.get("/api/feedbacks", async (req, res) => {
  res.json({ success: true, feedbacks: await listFeedback() });
});

export default router;
