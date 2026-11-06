import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Passed from the server at request time, so builds don't need these values.
export type SupabaseConfig = { url: string; key: string };

export function createClient({ url, key }: SupabaseConfig) {
  return createBrowserClient(url, key);
}

// Reset links are often opened in a different browser from the one that requested them,
// such as a mail app's built-in browser. This flow doesn't depend on the requesting browser.
export function createRecoveryClient({ url, key }: SupabaseConfig) {
  return createSupabaseClient(url, key, {
    auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: false, autoRefreshToken: false },
  });
}
