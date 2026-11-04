# Lash by Doye

Custom Next.js appointment-request website for Lash by Doye, London, Ontario.

## Stack
- Next.js App Router + TypeScript
- Responsive custom CSS
- Supabase for booking persistence (credentials required)
- Planned integrations: WhatsApp Business Cloud API and email notifications

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add the Supabase project URL, publishable key, service-role key, and the admin email.
3. In Supabase Authentication, create the studio admin user using the same email configured as `ADMIN_EMAIL`. Public sign-up is not enabled in the website.
4. Run `supabase-schema.sql` in the Supabase SQL editor.
5. Start locally with `npm run dev` and open `/admin` to review booking requests.

Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` and server hosting settings. Never expose or commit that key.

Online bookings and the private admin dashboard remain unavailable until Supabase credentials are configured. WhatsApp and email notifications are not automated yet; the admin dashboard provides direct contact links after a request is reviewed.
