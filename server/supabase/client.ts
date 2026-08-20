import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set.",
  );
}

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createBrowserClient>;
};

export const supabase =
  globalForSupabase.supabase || createBrowserClient(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}

export function getSupabaseClient() {
  return supabase;
}
