"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("unauthorized")) {
      setError("This account doesn’t have studio access. Sign in with the configured admin email.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("We couldn’t sign you in. Check your details and use the studio admin account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
      <section className="admin-login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Welcome <i>back.</i></h1>
        <p className="admin-login-copy">Sign in to review appointment requests and keep the studio moving.</p>
        {!configured ? (
          <p className="admin-alert" role="status">Supabase hasn’t been connected yet. Add the project URL and publishable key to <code>.env.local</code>, then restart the app.</p>
        ) : (
          <form className="admin-login-form" onSubmit={submit}>
            <label>Email address<input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="admin-alert" role="alert">{error}</p>}
            <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to requests"}</button>
          </form>
        )}
        <a className="admin-back-link" href="/">← Back to Lash by Doye</a>
      </section>
      <p className="admin-login-foot">LONDON, ONTARIO · BY APPOINTMENT</p>
    </main>
  );
}
