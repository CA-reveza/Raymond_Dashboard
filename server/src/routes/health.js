import { Router } from "express";
import { supabaseReady } from "../supabase.js";
import { nowIso } from "../lib/helpers.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "online",
    supabase_ready: supabaseReady,
    timestamp: nowIso(),
  });
});

export default router;
