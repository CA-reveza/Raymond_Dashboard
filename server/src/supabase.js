import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

export const supabaseReady = Boolean(url && key);

export const supabase = supabaseReady ? createClient(url, key) : null;

if (!supabaseReady) {
  console.warn(
    "⚠ SUPABASE_URL / SUPABASE_KEY are not set — running with in-memory data only. " +
      "Copy server/.env.example to server/.env and fill in your Supabase project details."
  );
}
