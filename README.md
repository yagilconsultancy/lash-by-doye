# Lash by Doye

Custom Next.js appointment-request website for Lash by Doye, London, Ontario.

## Stack
- Next.js App Router + TypeScript
- Responsive custom CSS
- Supabase for booking persistence (credentials required)
- Planned integrations: WhatsApp Business Cloud API and email notifications

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add Supabase project URL and service-role key.
3. Run `supabase-schema.sql` in the Supabase SQL editor.
4. Start locally with `npm run dev`.

Bookings remain disabled until Supabase credentials are configured. WhatsApp/email notifications, admin authentication and the private management dashboard are subsequent milestones.
