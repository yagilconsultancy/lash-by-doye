import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/server-env";

export function createAdminClient() {
  const url = getServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Supabase admin configuration is missing.");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
