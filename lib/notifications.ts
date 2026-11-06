import "server-only";
import { getServerEnv } from "@/lib/server-env";

type BookingNotification = {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
};

type Delivery = "sent" | "skipped" | "failed";

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  recipientSetting = "email recipient",
  html?: string,
  replyTo?: string,
): Promise<Delivery> {
  const apiKey = getServerEnv("RESEND_API_KEY");
  const from = getServerEnv("RESEND_FROM_EMAIL");
  const missing = [
    !apiKey && "RESEND_API_KEY",
    !from && "RESEND_FROM_EMAIL",
    !to && recipientSetting,
  ].filter(Boolean);
  if (missing.length) {
    console.warn("Resend email skipped; missing configuration:", missing.join(", "));
    return "skipped";
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text, ...(html ? { html } : {}), ...(replyTo ? { reply_to: replyTo } : {}) }),
    signal: AbortSignal.timeout(8_000),
  });

  if (response.ok) return "sent";

  const errorBody = await response.json().catch(() => null) as { name?: unknown } | null;
  console.error("Resend rejected an email request.", {
    status: response.status,
    errorCode: typeof errorBody?.name === "string" ? errorBody.name : "unknown_error",
  });
  return "failed";
}

// Customer replies go to the studio inbox rather than the sending address.
function studioInbox() {
  return getServerEnv("BOOKING_NOTIFICATION_EMAIL") || getServerEnv("ADMIN_EMAIL") || "";
}

type CustomerStatus = "pending" | "confirmed" | "rescheduled" | "declined" | "completed" | "cancelled";

type CustomerBooking = Pick<BookingNotification, "name" | "email" | "service" | "date" | "time"> & {
  confirmedDate?: string | null;
  confirmedTime?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] || character);
}

function customerEmailHtml(title: string, copy: string, booking: CustomerBooking, date: string, time: string, paymentDue = false) {
  const name = escapeHtml(booking.name);
  const service = escapeHtml(booking.service);
  const safeDate = escapeHtml(date);
  const safeTime = escapeHtml(time);
  const paymentNotice = paymentDue
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;background:#fffaf4;border:1px solid #eee1d5"><tr><td style="padding:13px 16px;color:#765f51;font-size:13px;line-height:1.6"><strong style="color:#9a664e">PAYMENT</strong><br>Payment is due upon arrival for your appointment.</td></tr></table>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#fff7f7;color:#21171a;font-family:Arial,sans-serif;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdfb;border:1px solid #ead8dc"><tr><td style="padding:28px 32px;border-bottom:1px solid #ead8dc"><span style="display:inline-block;width:42px;height:42px;line-height:42px;text-align:center;border-radius:50%;background:#f5d5dc;color:#a84d67;font-family:Georgia,serif;font-size:19px;font-style:italic;font-weight:bold">LD</span><span style="margin-left:12px;color:#21171a;font-size:11px;font-weight:bold;letter-spacing:2px">LASH BY DOYE</span></td></tr><tr><td style="padding:36px 32px 24px"><p style="margin:0 0 12px;color:#a6536d;font-size:10px;font-weight:bold;letter-spacing:2px">APPOINTMENT UPDATE</p><h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:normal;line-height:1.2">${title}</h1><p style="margin:0;color:#74666a;font-size:15px;line-height:1.7">Hi ${name}, ${copy}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#fff6f7;border:1px solid #f0dfe3"><tr><td style="padding:18px 20px;color:#806e72;font-size:11px;line-height:1.8">YOUR APPOINTMENT<br><strong style="color:#21171a;font-size:14px">${service}</strong><br>${safeDate} · ${safeTime}</td></tr></table>${paymentNotice}<p style="margin:24px 0 0;color:#74666a;font-size:14px;line-height:1.7">With care,<br><strong style="color:#21171a">Doye</strong></p></td></tr><tr><td style="padding:18px 32px;background:#21171a;color:#d9c9cd;font-size:10px;letter-spacing:1px">LASH BY DOYE · LONDON, ONTARIO</td></tr></table></td></tr></table></body></html>`;
}

function formatAppointmentDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(parsed);
}

export async function notifyBookingStatus(booking: CustomerBooking, status: CustomerStatus): Promise<Delivery> {
  const date = booking.confirmedDate || booking.date;
  const time = booking.confirmedTime || booking.time;
  const formattedDate = formatAppointmentDate(date);
  const titleAndCopy: Record<CustomerStatus, { subject: string; title: string; copy: string; paymentDue?: boolean }> = {
    pending: {
      subject: "Your Lash by Doye request is under review",
      title: "Your request is being reviewed.",
      copy: "your appointment request is back under review. We’ll be in touch once the studio has reviewed the details.",
      paymentDue: true,
    },
    confirmed: {
      subject: "Your Lash by Doye appointment is confirmed",
      title: "Your appointment is confirmed.",
      copy: "your appointment is confirmed. We look forward to seeing you.",
      paymentDue: true,
    },
    rescheduled: {
      subject: "Your Lash by Doye appointment has been updated",
      title: "Your appointment details have changed.",
      copy: "your appointment has been rescheduled. Please see the updated details below.",
      paymentDue: true,
    },
    declined: {
      subject: "An update about your Lash by Doye request",
      title: "We couldn’t confirm this appointment.",
      copy: "we’re unable to confirm this appointment request. Please reply to this email if you’d like to discuss another time.",
    },
    completed: {
      subject: "Thank you for visiting Lash by Doye",
      title: "Thank you for coming in.",
      copy: "thank you for choosing Lash by Doye. We hope you love your lashes and would be happy to see you again.",
    },
    cancelled: {
      subject: "Your Lash by Doye appointment was cancelled",
      title: "Your appointment has been cancelled.",
      copy: "your appointment has been cancelled. Please reply to this email if you’d like help arranging another time.",
    },
  };
  const content = titleAndCopy[status];
  const text = [
    `Hi ${booking.name},`, "", content.copy,
    "", `Service: ${booking.service}`, `Appointment: ${formattedDate} at ${time}`,
    ...(content.paymentDue ? ["", "Payment: Due upon arrival for your appointment."] : []),
    "", "With care,", "Doye", "Lash by Doye · London, Ontario",
  ].join("\n");
  return sendEmail(booking.email, content.subject, text, "customer email", customerEmailHtml(
    content.title, content.copy.replace(/^your /, "Your "), booking, formattedDate, time, content.paymentDue,
  ), studioInbox());
}

async function sendWhatsAppTemplate(booking: BookingNotification): Promise<Delivery> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_BUSINESS_NUMBER;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!accessToken || !phoneNumberId || !recipient || !templateName || !apiVersion) {
    return "skipped";
  }
  if (!/^v\d+\.\d+$/.test(apiVersion)) return "failed";

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient.replace(/\D/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: booking.name },
            { type: "text", text: booking.service },
            { type: "text", text: booking.date },
            { type: "text", text: booking.time },
            { type: "text", text: booking.phone },
            { type: "text", text: booking.email },
            { type: "text", text: booking.notes || "None" },
          ],
        }],
      },
    }),
    signal: AbortSignal.timeout(8_000),
  });

  return response.ok ? "sent" : "failed";
}

export async function notifyBooking(booking: BookingNotification) {
  const bookingDetails = [
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Service: ${booking.service}`,
    `Preferred date: ${booking.date}`,
    `Preferred time: ${booking.time}`,
    `Notes: ${booking.notes || "None"}`,
  ].join("\n");

  const safely = async (channel: string, send: Promise<Delivery>): Promise<Delivery> => {
    try {
      return await send;
    } catch (error) {
      console.error(`${channel} notification request failed.`, error instanceof Error ? error.name : "UnknownError");
      return "failed";
    }
  };

  const [ownerEmail, customerEmail] = await Promise.all([
    safely("Studio Resend email", sendEmail(
    studioInbox(),
    `New booking request: ${booking.name}`,
    `A new request is waiting for review.\n\n${bookingDetails}\n\nOpen the private studio dashboard to review it.`,
    "BOOKING_NOTIFICATION_EMAIL or ADMIN_EMAIL",
    undefined,
    booking.email,
    )),
    safely("Customer Resend email", sendEmail(
      booking.email,
      "We received your Lash by Doye booking request",
      `Hi ${booking.name},\n\nWe received your appointment request. It is not confirmed yet; the studio will contact you to confirm the appointment.\n\nService: ${booking.service}\nPreferred date: ${booking.date}\nPreferred time: ${booking.time}\nPayment: Due upon arrival for your appointment.\n\nThank you for supporting Lash by Doye.`,
      "customer email",
      customerEmailHtml(
        "We’ve received your request.",
        "we’ve received your appointment request. It isn’t confirmed yet; we’ll be in touch to confirm the details.",
        booking,
        formatAppointmentDate(booking.date),
        booking.time,
        true,
      ),
      studioInbox(),
    )),
  ]);

  // WhatsApp stays paused; Resend is the only active notification channel.
  const whatsapp: Delivery = "skipped";

  return { ownerEmail, customerEmail, whatsapp } satisfies Record<string, Delivery>;
}
