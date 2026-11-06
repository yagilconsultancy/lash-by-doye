"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseConfig } from "@/lib/supabase/client";

type Booking = {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  service_name: string;
  quoted_price: number | null;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: "pending" | "confirmed" | "rescheduled" | "declined" | "completed" | "cancelled";
  confirmed_date: string | null;
  confirmed_time: string | null;
  created_at: string;
};

const dateLabel = (date: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric",
}).format(new Date(`${date}T12:00:00`));

export default function AdminDashboard({ email, supabaseConfig }: { email: string; supabaseConfig: SupabaseConfig }) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTime, setConfirmedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/bookings", { cache: "no-store" });
      const result = await response.json() as { error?: string; bookings: Booking[] };
      if (!response.ok) throw new Error(result.error || "We couldn't load booking requests.");
      setBookings(result.bookings as Booking[]);
      setSelectedId((current) => current || result.bookings[0]?.id || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't load booking requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBookings(); }, [loadBookings]);

  const pendingCount = useMemo(() => bookings.filter((booking) => booking.status === "pending").length, [bookings]);
  const visibleBookings = filter === "pending"
    ? bookings.filter((booking) => booking.status === "pending")
    : bookings;
  const selected = visibleBookings.find((booking) => booking.id === selectedId) || visibleBookings[0];
  const phoneDigits = selected?.phone.replace(/\D/g, "") || "";
  const whatsappNumber = phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits;

  useEffect(() => {
    if (!selected) return;
    setConfirmedDate(selected.confirmed_date || selected.preferred_date);
    setConfirmedTime(selected.confirmed_time || "");
  }, [selected?.id, selected?.confirmed_date, selected?.confirmed_time, selected?.preferred_date]);

  async function updateBooking(status: Booking["status"]) {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status, confirmedDate, confirmedTime }),
      });
      const result = await response.json() as { error?: string; booking?: Partial<Booking>; notification?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't update this request.");
      setBookings((current) => current.map((booking) => booking.id === selected.id ? { ...booking, ...result.booking } : booking));
      if (status !== "pending") setFilter("all");
      setMessage(result.notification === "unchanged"
        ? "That's already the appointment time, so nothing changed."
        : result.notification === "sent"
        ? `Appointment ${status}. The client was emailed an update.`
        : result.notification === "failed" || result.notification === "skipped"
          ? `Appointment ${status}, but the client email could not be sent. Please contact them directly.`
          : `Request marked ${status}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't update this request.");
    } finally {
      setSaving(false);
    }
  }

  async function resendStatusEmail() {
    if (!selected) return;
    setEmailSending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, retryEmail: true }),
      });
      const result = await response.json() as { error?: string; booking?: Partial<Booking>; notification?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't resend the status email.");
      setMessage(result.notification === "sent"
        ? `The ${selected.status} update email was sent to ${selected.email}.`
        : "The email could not be sent. Check the Resend settings and try again.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't resend the status email.");
    } finally {
      setEmailSending(false);
    }
  }

  async function signOut() {
    await createClient(supabaseConfig).auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="admin-wordmark" href="/"><span className="admin-monogram">LD</span><span>LASH BY DOYE</span></a>
        <div className="admin-account"><span>{email}</span><button onClick={() => void signOut()}>Sign out</button></div>
      </header>
      <section className="admin-intro">
        <div><h1>Booking <i>requests.</i></h1><p>Studio desk · London, Ontario · Review requests, confirm appointments, and keep clients updated by email.</p></div>
        <button className="admin-refresh" onClick={() => void loadBookings()} disabled={loading}>Refresh requests</button>
      </section>
      <div className="admin-workspace">
        <section className="request-queue" aria-label="Booking request list">
          <div className="queue-head"><div><h2>Requests</h2><span className="pending-pill">{pendingCount} waiting</span></div><div className="queue-tabs" role="group" aria-label="Filter requests"><button aria-pressed={filter === "pending"} className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button><button aria-pressed={filter === "all"} className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button></div></div>
          {loading ? <p className="queue-empty">Loading requests…</p> : error && !bookings.length ? <p className="queue-empty">{error}</p> : visibleBookings.length === 0 ? <div className="queue-empty"><p>{filter === "pending" ? "You’re all caught up." : "No booking requests yet."}</p><small>New requests will appear here for your review.</small></div> : (
            <ul className="request-list">{visibleBookings.map((booking) => <li key={booking.id}><button className={`request-item ${selected?.id === booking.id ? "selected" : ""}`} onClick={() => { setSelectedId(booking.id); setMessage(""); setError(""); }}><span className="request-date">{dateLabel(booking.preferred_date)}</span><span className="request-person">{booking.customer_name}</span><span className="request-service">{booking.service_name} · {booking.preferred_time}</span><span className={`status-tag ${booking.status}`}>{booking.status}</span></button></li>)}</ul>
          )}
        </section>
        <section className="request-detail" aria-label="Selected booking details">
          {!selected ? <div className="detail-empty"><p>Select a request to review its details.</p></div> : <>
            <div className="detail-top"><h2>{selected.customer_name}</h2><span className={`status-tag ${selected.status}`}>{selected.status}</span></div>
            <div className="detail-service"><span>{selected.service_name}</span><b>{selected.quoted_price == null ? "Price to confirm" : `$${selected.quoted_price} CAD`}</b></div>
            <dl className="client-details"><div><dt>Preferred date</dt><dd>{dateLabel(selected.preferred_date)}</dd></div><div><dt>Preferred time</dt><dd>{selected.preferred_time}</dd></div><div><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div><div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div></dl>
            {selected.notes && <div className="client-note"><span>CLIENT NOTE</span><p>{selected.notes}</p></div>}
            {selected.status === "pending" || selected.status === "confirmed" || selected.status === "rescheduled" ? (
              <div className="confirm-block">
                <h3>{selected.status === "pending" ? "Choose the appointment time" : "Appointment time"}</h3>
                <p>{selected.status === "pending" ? "The requested date is a preference. Confirm the exact time with the client before saving." : "Update the date or time if the client needs to reschedule."}</p>
                <div className="confirm-fields">
                  <label>Confirmed date<input type="date" value={confirmedDate} onChange={(event) => setConfirmedDate(event.target.value)} /></label>
                  <label>Time<select value={confirmedTime} onChange={(event) => setConfirmedTime(event.target.value)}><option value="">Choose a time</option>{["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"].map((time) => <option key={time}>{time}</option>)}</select></label>
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" onClick={() => void updateBooking(selected.status === "pending" ? "confirmed" : "rescheduled")} disabled={saving}>{saving ? "Saving…" : selected.status === "pending" ? "Confirm appointment" : "Save new time"}</button>
                  {selected.status === "pending" ? <button className="admin-secondary" onClick={() => void updateBooking("declined")} disabled={saving}>Decline request</button> : <><button className="admin-secondary" onClick={() => void updateBooking("completed")} disabled={saving}>Mark completed</button><button className="admin-quiet" onClick={() => void updateBooking("cancelled")} disabled={saving}>Cancel appointment</button></>}
                </div>
              </div>
            ) : <div className="confirm-block"><h3>Request closed</h3><p>This request is marked {selected.status}.</p></div>}
            {error && <p className="admin-alert" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
            <div className="contact-actions"><span>CONTACT THE CLIENT</span><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`mailto:${selected.email}`}>Email</a></div>
            <button className="admin-quiet" onClick={() => void resendStatusEmail()} disabled={emailSending}>{emailSending ? "Sending email…" : "Resend status email"}</button>
            <p className="admin-note">Clients receive email updates when their appointment status changes.</p>
          </>}
        </section>
      </div>
      <footer className="admin-footer">LASH BY DOYE <span>PRIVATE STUDIO DESK</span></footer>
    </main>
  );
}
