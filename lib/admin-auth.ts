import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getSignedInEmail() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const email = typeof data?.claims?.email === "string"
      ? data.claims.email.trim().toLowerCase()
      : "";

    if (error || !email) return null;
    return email;
  } catch {
    return null;
  }
}

export async function getAuthorizedAdmin() {
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const email = await getSignedInEmail();
  if (!allowedEmail || !email || email !== allowedEmail) return null;
  return { email };
}
