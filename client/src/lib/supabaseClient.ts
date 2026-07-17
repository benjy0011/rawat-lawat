import { createClient } from "@supabase/supabase-js";

// The React app talks to Postgres directly through supabase-js. Keys come from
// Vite env vars (see .env.example) and are safe to expose in the browser: the
// anon key only grants what the database's row-level security policies allow.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase configuration. Copy client/.env.example to " +
      "client/.env.local and set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
