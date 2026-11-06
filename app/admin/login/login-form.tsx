"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseConfig } from "@/lib/supabase/client";

export default function AdminLogin({ supabaseConfig }: { supabaseConfig: SupabaseConfig | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);
  const [magicMessage, setMagicMessage] = useState("");

  useEffect(() => {
    setPasswordReset(new URLSearchParams(window.location.search).has("password-reset"));
    if (new URLSearchParams(window.location.search).has("unauthorized")) {
      setError("This account doesn’t have studio access. Sign in with the configured admin email.");
    }
    if (new URLSearchParams(window.location.search).has("magic-link-error")) {
      setError("That sign-in link couldn’t be verified. Request a fresh link and open it in this browser.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient(supabaseConfig!);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Unknown error";
      setError(`We couldn’t sign you in: ${detail}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    setError("");
    setMagicMessage("");
    if (!email.trim()) {
      setError("Enter the studio admin email address first.");
      return;
    }
    setMagicBusy(true);
    try {
      const supabase = createClient(supabaseConfig!);
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (linkError) throw linkError;
      setMagicMessage("If this is the studio admin email, a sign-in link is on its way. Open the newest email in this browser within 60 minutes.");
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Unknown error";
      setError(`We couldn’t send a sign-in link: ${detail}`);
    } finally {
      setMagicBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
      <section className="admin-login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Welcome <i>back.</i></h1>
        <p className="admin-login-copy">Sign in to review appointment requests and keep the studio moving.</p>
        {!supabaseConfig ? (
          <p className="admin-alert" role="status">Supabase hasn’t been connected yet. Add the project URL and publishable key to the site settings, then try again.</p>
        ) : (
          <>
            {passwordReset && (
              <p className="admin-success" role="status">Your password has been updated. Sign in with your new password.</p>
            )}
            <form className="admin-login-form" onSubmit={submit}>
              <label>Email address<input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {error && <p className="admin-alert" role="alert">{error}</p>}
              <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to requests"}</button>
              <button className="admin-secondary admin-link-button" type="button" onClick={sendMagicLink} disabled={magicBusy}>{magicBusy ? "Sending link…" : "Email me a sign-in link"}</button>
              {magicMessage && <p className="admin-success" role="status">{magicMessage}</p>}
            </form>
            <a className="admin-back-link admin-forgot-link" href="/admin/reset-password">Forgot your password?</a>
          </>
        )}
        <a className="admin-back-link" href="/">← Back to Lash by Doye</a>
      </section>
      <p className="admin-login-foot">LONDON, ONTARIO · BY APPOINTMENT</p>
    </main>
  );
}
