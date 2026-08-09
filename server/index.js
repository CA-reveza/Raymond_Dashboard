import "./src/env.js";

import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import healthRoute from "./src/routes/health.js";
import menuRoute from "./src/routes/menu.js";
import customersRoute from "./src/routes/customers.js";
import couponsRoute from "./src/routes/coupons.js";
import redemptionsRoute from "./src/routes/redemptions.js";
import ordersRoute from "./src/routes/orders.js";
import feedbackRoute from "./src/routes/feedback.js";
import marketplaceRoute from "./src/routes/marketplace.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoute);
app.use(menuRoute);
app.use(customersRoute);
app.use(couponsRoute);
app.use(redemptionsRoute);
app.use(ordersRoute);
app.use(feedbackRoute);
app.use(marketplaceRoute);

// Serve the built dashboard (npm run build:dashboard) if it exists, so a
// single Render service can host both the API and the dashboard UI.
const dashboardDist = path.join(__dirname, "..", "dashboard-app", "dist");
if (fs.existsSync(dashboardDist)) {
  app.use(express.static(dashboardDist));
  app.get(["/", "/dashboard-ui"], (req, res) => {
    res.sendFile(path.join(dashboardDist, "index.html"));
  });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`AXIONIK server running on port ${PORT}`);
});
