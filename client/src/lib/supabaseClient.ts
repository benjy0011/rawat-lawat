import { createClient } from "@supabase/supabase-js";

// The React app talks to Postgres directly through supabase-js. Keys come from
// Vite env vars (see .env.example) and are safe to expose in the browser: the
// anon key only grants what the database's row-level security policies allow.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Copy client/.env.example to " +
      "client/.env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
