import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/server-env";

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

/** ADMIN_EMAIL can hold several addresses separated by commas. */
export function getAdminEmails() {
  return (getServerEnv("ADMIN_EMAIL") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAuthorizedAdmin() {
  const allowedEmails = getAdminEmails();
  const email = await getSignedInEmail();
  if (!email || !allowedEmails.includes(email)) return null;
  return { email };
}
