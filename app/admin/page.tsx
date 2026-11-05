import { redirect } from "next/navigation";
import { getSignedInEmail } from "@/lib/admin-auth";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ready = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.ADMIN_EMAIL,
  );

  if (!ready) {
    return (
      <main className="admin-login-page">
        <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
        <section className="admin-login-panel">
          <h1>Your studio, <i>at a glance.</i></h1>
          <p className="admin-login-copy">Connect the Supabase project and admin account in <code>.env.local</code> to open appointment requests.</p>
          <a className="admin-primary admin-link-button" href="/admin/login">Go to sign in</a>
        </section>
      </main>
    );
  }

  const email = await getSignedInEmail();
  if (!email) redirect("/admin/login");
  if (email !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
    redirect("/admin/login?unauthorized=1");
  }
  return <AdminDashboard email={email} />;
}
