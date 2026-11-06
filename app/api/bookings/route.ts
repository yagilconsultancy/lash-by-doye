import { NextResponse } from "next/server";
import { services } from "@/lib/services";
import { notifyBooking } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/server-env";

const preferredTimes = ["Flexible", "Morning", "Afternoon", "Evening"];
const maxLength = { name: 100, phone: 30, email: 254, notes: 1000 };
const maxRequestsPerEmailPerDay = 3;
const maxRequestsPerHour = 20;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, any>;

    // Hidden field only bots fill in. Answer normally so they don't adapt.
    if (body.company) {
      return NextResponse.json({ ok: true, customerEmail: "skipped" }, { status: 201 });
    }

    for (const field of ["name", "phone", "email", "service", "date", "time"]) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
      }
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: "Please agree to be contacted about your request." }, { status: 400 });
    }

    const name = body.name.trim();
    const phone = body.phone.trim();
    const email = body.email.trim().toLowerCase();
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (name.length > maxLength.name) {
      return NextResponse.json({ error: "Please shorten your name." }, { status: 400 });
    }
    if (email.length > maxLength.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const phoneDigits = phone.replace(/\D/g, "").length;
    if (phone.length > maxLength.phone || !/^[+\d\s().-]+$/.test(phone) || phoneDigits < 10 || phoneDigits > 15) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (notes.length > maxLength.notes) {
      return NextResponse.json({ error: `Please keep your notes under ${maxLength.notes} characters.` }, { status: 400 });
    }
    if (!preferredTimes.includes(body.time)) {
      return NextResponse.json({ error: "Please choose a preferred time." }, { status: 400 });
    }
    const requestedService = services.find((service) => service.name === body.service);
    if (!requestedService) {
      return NextResponse.json({ error: "Please choose a service from the menu." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: "Please choose a valid appointment date." }, { status: 400 });
    }
    const requestedDate = new Date(`${body.date}T00:00:00.000Z`);
    if (Number.isNaN(requestedDate.valueOf()) || requestedDate.toISOString().slice(0, 10) !== body.date) {
      return NextResponse.json({ error: "Please choose a valid appointment date." }, { status: 400 });
    }
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    if (body.date < today) {
      return NextResponse.json({ error: "Please choose today or a future date." }, { status: 400 });
    }

    if (!getServerEnv("NEXT_PUBLIC_SUPABASE_URL") || !getServerEnv("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Online booking is being configured. Please contact the studio directly for now." },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();
    const now = Date.now();
    const [sameEmail, allRecent] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("bookings").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(now - 60 * 60 * 1000).toISOString()),
    ]);
    if (sameEmail.error || allRecent.error) {
      console.error("Booking limit check failed:", sameEmail.error?.message || allRecent.error?.message);
      return NextResponse.json({ error: "We couldn't save your request. Please try again shortly." }, { status: 502 });
    }
    if ((sameEmail.count ?? 0) >= maxRequestsPerEmailPerDay) {
      return NextResponse.json({ error: "We already have your requests. Doye will be in touch soon." }, { status: 429 });
    }
    if ((allRecent.count ?? 0) >= maxRequestsPerHour) {
      return NextResponse.json({ error: "We're receiving a lot of requests right now. Please try again in a little while." }, { status: 429 });
    }

    const { error: saveError } = await supabase.from("bookings").insert({
      customer_name: name,
      phone,
      email,
      service_name: body.service,
      quoted_price: requestedService.launchPrice,
      preferred_date: body.date,
      preferred_time: body.time,
      notes,
      status: "pending",
    });

    if (saveError) {
      console.error("Booking save failed:", saveError.message);
      return NextResponse.json({ error: "We couldn't save your request. Please try again shortly." }, { status: 502 });
    }

    const delivery = await notifyBooking({ name, phone, email, service: body.service, date: body.date, time: body.time, notes });
    const failedChannels = Object.entries(delivery)
      .filter(([, status]) => status === "failed")
      .map(([channel]) => channel);
    if (failedChannels.length) {
      console.warn("Booking saved; notification delivery failed for:", failedChannels.join(", "));
    }

    return NextResponse.json({ ok: true, customerEmail: delivery.customerEmail }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
}
