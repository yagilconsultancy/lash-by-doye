"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseConfig } from "@/lib/supabase/client";

export default function AdminResetPassword({ supabaseConfig }: { supabaseConfig: SupabaseConfig | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [recoveryCallback, setRecoveryCallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabaseConfig) return;
    const recoveryInUrl = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    const codeInUrl = new URLSearchParams(window.location.search).has("code");
    const recoveryCallback = recoveryInUrl || codeInUrl;
    setRecoveryCallback(recoveryCallback);
    const supabase = createClient(supabaseConfig!);

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active || !recoveryCallback) return;
      if (data.session) {
        setError("");
        setRecoveryReady(true);
      } else {
        setError("The link opened, but Supabase did not establish a reset session. Open the newest email link in the same browser where you requested it. If it still fails, request another link and open it promptly.");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) {
        setError("");
        setRecoveryReady(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabaseConfig]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient(supabaseConfig!);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage("If an account exists for that email, a fresh reset link is on its way. Check your inbox and spam folder.");
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Unknown error";
      setError(`We couldn’t send a reset link: ${detail}`);
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don’t match. Please check them and try again.");
      return;
    }

    setBusy(true);
    let updated = false;
    try {
      const supabase = createClient(supabaseConfig!);
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      updated = true;
      // End the recovery session across devices after the new password is saved.
      await supabase.auth.signOut({ scope: "global" }).catch(() => undefined);
      router.replace("/admin/login?password-reset=1");
      router.refresh();
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Unknown error";
      setError(updated
        ? "Your password was changed. Please return to sign in and use the new password."
        : `We couldn’t update the password: ${detail}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
      <section className="admin-login-panel" aria-labelledby="reset-title">
        <h1 id="reset-title">{recoveryReady ? <>Choose a <i>new password.</i></> : <>Forgot your <i>password?</i></>}</h1>
        <p className="admin-login-copy">
          {recoveryReady
            ? "Set a new password for the studio admin account. Use at least 8 characters."
            : "Enter the studio admin email and we’ll send you a fresh password reset link."}
        </p>
        {!supabaseConfig ? (
          <p className="admin-alert" role="status">The password reset service isn’t connected yet. Check the Supabase settings and try again.</p>
        ) : recoveryReady ? (
          <form className="admin-login-form" onSubmit={updatePassword}>
            <label>New password<input autoComplete="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <label>Confirm new password<input autoComplete="new-password" type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
            {error && <p className="admin-alert" role="alert">{error}</p>}
            <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Updating password…" : "Save new password"}</button>
          </form>
        ) : (
          <>
          {recoveryCallback && error && <p className="admin-alert" role="alert">{error}</p>}
          <form className="admin-login-form" onSubmit={requestReset}>
            <label>Admin email address<input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            {!recoveryCallback && error && <p className="admin-alert" role="alert">{error}</p>}
            {message && <p className="admin-success" role="status">{message}</p>}
            <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Sending link…" : "Email me a reset link"}</button>
          </form>
          </>
        )}
        <a className="admin-back-link" href="/admin/login">← Back to sign in</a>
      </section>
      <p className="admin-login-foot">LONDON, ONTARIO · BY APPOINTMENT</p>
    </main>
  );
}
