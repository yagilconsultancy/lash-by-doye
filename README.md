# Lash by Doye

Custom Next.js appointment-request website for Lash by Doye, London, Ontario.

## Stack
- Next.js App Router + TypeScript
- Responsive custom CSS
- Supabase for booking persistence (credentials required)
- Resend for booking email notifications
- WhatsApp Business Cloud API (paused; no messages are sent)

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add the Supabase project URL, publishable key, service-role key, and the admin email.
3. In Supabase Authentication, create the studio admin user using the same email configured as `ADMIN_EMAIL`. Public sign-up is not enabled in the website.
4. Run `supabase-schema.sql` in the Supabase SQL editor.
5. Start locally with `npm run dev` and open `/admin` to review booking requests.

Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` and server hosting settings. Never expose or commit that key.

Online bookings and the private admin dashboard remain unavailable until Supabase credentials are configured.

## Deploying to Cloudflare

The live site runs on Cloudflare Workers through vinext.

1. Run `npm run build:vinext`, then `npm run deploy:vinext`.
2. Add every variable from `cloudflare.config.ts` as a Worker secret. Values are read when the site runs, so builds don't need them.
3. In Supabase Authentication, set the Site URL to `https://lashbydoye.com` and add `https://lashbydoye.com/auth/callback` and `https://lashbydoye.com/admin/reset-password` as redirect URLs.
4. Add a Cloudflare rate limiting rule for `/api/bookings` to cap requests per IP address.

## Booking limits

The booking API rejects a request when the same email has made 3 requests in 24 hours, or when the site has received 20 requests in the past hour. A hidden form field also filters out basic bots. Change the limits at the top of `app/api/bookings/route.ts`.

## Booking notifications

After a booking is saved, the server can send:
- A full booking alert to `BOOKING_NOTIFICATION_EMAIL` through Resend, including the customer's name, phone, email, service, preferred date/time and notes.
- A customer receipt email explaining that the request is not yet confirmed.
- Customer email updates when the studio confirms, reschedules, declines, cancels, or completes an appointment.
- Payment is due upon arrival, and a $10 fee applies to cancellations under 24 hours and no-shows. Both reminders appear on the booking form and pre-appointment customer emails.

Configure `RESEND_API_KEY` with a Resend **Sending access** key restricted to the verified `lashbydoye.com` domain. Set `RESEND_FROM_EMAIL` to a sender on that domain, for example `Lash by Doye <bookings@lashbydoye.com>`. `BOOKING_NOTIFICATION_EMAIL` is optional; if omitted, `ADMIN_EMAIL` receives studio alerts. Customer receipt emails send independently of studio alert delivery.

For local development, place these values in `.env.local` and restart `npm run dev` after changing them. For the live site, add the same variables to the hosting provider's server-side environment settings and redeploy. Never commit `.env.local` or paste the API key into chat.

For WhatsApp, configure an access token, sender `WHATSAPP_PHONE_NUMBER_ID`, the studio recipient number in international format, and the current Graph API version. Create and get approval for a utility message template named `new_booking_request` with language `en_US` and this body (the placeholders must stay in this order):

```text
New Lash by Doye booking request
Name: {{1}}
Service: {{2}}
Preferred date: {{3}}
Preferred time: {{4}}
Phone: {{5}}
Email: {{6}}
Notes: {{7}}
Please review and contact the client.
```

Set the exact template name and language in the WhatsApp environment variables. Meta requires approved templates for these business-initiated alerts; the send API uses the phone-number ID and `/messages` endpoint.

Resend is the only active notification provider; WhatsApp remains paused. A provider failure does not undo the saved booking; the admin dashboard reports when a customer email could not be sent. Keep all provider tokens in `.env.local` and production hosting secrets, never in GitHub.
