import { getServerEnv } from "@/lib/server-env";
import AdminResetPassword from "./reset-form";

export const dynamic = "force-dynamic";

export default function Page() {
  const url = getServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return <AdminResetPassword supabaseConfig={url && key ? { url, key } : null} />;
}
