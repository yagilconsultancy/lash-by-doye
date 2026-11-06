import { NextResponse } from "next/server";
import { getAuthorizedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyBookingStatus } from "@/lib/notifications";
import { getServerEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";

const bookingStatuses = [
  "pending",
  "confirmed",
  "rescheduled",
  "declined",
  "completed",
  "cancelled",
] as const;

export async function GET() {
  if (!getServerEnv("NEXT_PUBLIC_SUPABASE_URL") || !getServerEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json({ error: "The admin dashboard is not connected yet." }, { status: 503 });
  }

  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Please sign in with the studio admin account." }, { status: 401 });
  }

  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("id,customer_name,phone,email,service_name,quoted_price,preferred_date,preferred_time,notes,status,confirmed_date,confirmed_time,created_at")
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin booking list failed:", error.message);
    return NextResponse.json({ error: "We couldn't load booking requests. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ bookings: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  if (!getServerEnv("NEXT_PUBLIC_SUPABASE_URL") || !getServerEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json({ error: "The admin dashboard is not connected yet." }, { status: 503 });
  }

  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Please sign in with the studio admin account." }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { id, status, confirmedDate, confirmedTime, retryEmail } = body;
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "Choose a valid booking request." }, { status: 400 });
    }
    if (retryEmail === true) {
      const { data: booking, error } = await createAdminClient()
        .from("bookings")
        .select("id,status,customer_name,email,service_name,preferred_date,preferred_time,confirmed_date,confirmed_time")
        .eq("id", id)
        .maybeSingle();
      if (error || !booking) {
        return NextResponse.json({ error: "We couldn't find this booking to resend its email." }, { status: error ? 502 : 404 });
      }
      let notification: "sent" | "skipped" | "failed";
      try {
        notification = await notifyBookingStatus({
          name: booking.customer_name,
          email: booking.email,
          service: booking.service_name,
          date: booking.preferred_date,
          time: booking.preferred_time,
          confirmedDate: booking.confirmed_date,
          confirmedTime: booking.confirmed_time,
        }, booking.status);
      } catch (error) {
        console.error("Customer status email retry failed.", error instanceof Error ? error.name : "UnknownError");
        notification = "failed";
      }
      return NextResponse.json({ notification }, { headers: { "Cache-Control": "private, no-store" } });
    }

    if (!bookingStatuses.includes(status)) {
      return NextResponse.json({ error: "Choose a valid booking status." }, { status: 400 });
    }
    if (["confirmed", "rescheduled"].includes(status)) {
      if (typeof confirmedDate !== "string" || typeof confirmedTime !== "string" || !confirmedTime.trim()) {
        return NextResponse.json({ error: "Add the confirmed date and time before saving." }, { status: 400 });
      }
      const date = new Date(`${confirmedDate}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(confirmedDate) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== confirmedDate) {
        return NextResponse.json({ error: "Choose a valid confirmed date." }, { status: 400 });
      }
    }

    const supabase = createAdminClient();
    const { data: previous, error: lookupError } = await supabase
      .from("bookings")
      .select("id,status,customer_name,email,service_name,preferred_date,preferred_time,confirmed_date,confirmed_time")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Admin booking lookup failed:", lookupError.message);
      return NextResponse.json({ error: "We couldn't update this request. Please try again." }, { status: 502 });
    }
    if (!previous) {
      return NextResponse.json({ error: "This booking request could not be found." }, { status: 404 });
    }

    const appointmentChanged = ["confirmed", "rescheduled"].includes(status)
      && (previous.confirmed_date !== confirmedDate || previous.confirmed_time !== confirmedTime.trim());
    if (status === "rescheduled" && previous.status !== "pending" && !appointmentChanged) {
      return NextResponse.json(
        { booking: { id, status: previous.status, confirmed_date: previous.confirmed_date, confirmed_time: previous.confirmed_time }, notification: "unchanged" },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status,
        confirmed_date: ["confirmed", "rescheduled"].includes(status) ? confirmedDate : status === "pending" ? null : previous.confirmed_date,
        confirmed_time: ["confirmed", "rescheduled"].includes(status) ? confirmedTime?.trim() : status === "pending" ? null : previous.confirmed_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", previous.status)
      .select("id,status,confirmed_date,confirmed_time")
      .maybeSingle();

    if (error) {
      console.error("Admin booking update failed:", error.message);
      return NextResponse.json({ error: "We couldn't update this request. Please try again." }, { status: 502 });
    }
    if (!data) {
      return NextResponse.json({ error: "This request changed while you were editing it. Refresh the dashboard and try again." }, { status: 409 });
    }

    let notification: "sent" | "skipped" | "failed" = "skipped";
    if (previous.status !== status || appointmentChanged) {
      try {
        notification = await notifyBookingStatus({
          name: previous.customer_name,
          email: previous.email,
          service: previous.service_name,
          date: previous.preferred_date,
          time: previous.preferred_time,
          confirmedDate: data.confirmed_date,
          confirmedTime: data.confirmed_time,
        }, status);
      } catch (error) {
        console.error("Customer status email failed.", error instanceof Error ? error.name : "UnknownError");
        notification = "failed";
      }
    }

    return NextResponse.json({ booking: data, notification }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Please check the booking details and try again." }, { status: 400 });
  }
}
