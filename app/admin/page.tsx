import { redirect } from "next/navigation";
import { getSignedInEmail } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/server-env";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabaseUrl = getServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const serviceKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = getServerEnv("ADMIN_EMAIL");
  const ready = Boolean(supabaseUrl && supabaseKey && serviceKey && adminEmail);

  if (!ready) {
    return (
      <main className="admin-login-page">
        <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
        <section className="admin-login-panel">
          <h1>Your studio, <i>at a glance.</i></h1>
          <p className="admin-login-copy">The studio dashboard will open once its Supabase connection and admin account are configured.</p>
          <a className="admin-primary admin-link-button" href="/admin/login">Go to sign in</a>
        </section>
      </main>
    );
  }

  const email = await getSignedInEmail();
  if (!email) redirect("/admin/login");
  if (email !== adminEmail?.trim().toLowerCase()) {
    redirect("/admin/login?unauthorized=1");
  }
  return <AdminDashboard email={email} supabaseConfig={{ url: supabaseUrl!, key: supabaseKey! }} />;
}
