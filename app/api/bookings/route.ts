import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    for (const field of ["name", "phone", "email", "service", "date", "time"]) {
      if (!body[field] || typeof body[field] !== "string") {
        return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { error: "Online booking is being configured. Please contact the studio directly for now." },
        { status: 503 }
      );
    }

    const result = await fetch(url + "/rest/v1/bookings", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        customer_name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email.trim().toLowerCase(),
        service_name: body.service,
        quoted_price: Number(body.price),
        preferred_date: body.date,
        preferred_time: body.time,
        notes: typeof body.notes === "string" ? body.notes.trim() : "",
        status: "pending"
      })
    });

    if (!result.ok) {
      console.error(await result.text());
      return NextResponse.json({ error: "We couldn't save your request. Please try again shortly." }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
}
