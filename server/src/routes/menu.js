import { Router } from "express";
import { STORE } from "../lib/helpers.js";

const router = Router();

router.get("/api/menu/:storeId", (req, res) => {
  res.json({
    store_id: req.params.storeId,
    name: STORE.name,
    offers: STORE.offers,
  });
});

export default router;
