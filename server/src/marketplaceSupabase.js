import { createClient } from "@supabase/supabase-js";

const url = process.env.MARKETPLACE_SUPABASE_URL;
const key = process.env.MARKETPLACE_SUPABASE_KEY;

export const marketplaceReady = Boolean(url && key);

export const marketplaceDb = marketplaceReady ? createClient(url, key) : null;

if (!marketplaceReady) {
  console.warn(
    "⚠ MARKETPLACE_SUPABASE_URL / MARKETPLACE_SUPABASE_KEY are not set — " +
      "the customer Marketplace activity panel will return empty results."
  );
}
