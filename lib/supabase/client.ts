import { createBrowserClient } from "@supabase/ssr";

// Passed from the server at request time, so builds don't need these values.
export type SupabaseConfig = { url: string; key: string };

export function createClient({ url, key }: SupabaseConfig) {
  return createBrowserClient(url, key);
}
