create table if not exists public.bookings (id uuid primary key default gen_random_uuid(),customer_name text not null,phone text not null,email text not null,service_name text not null,quoted_price numeric(8,2),preferred_date date not null,preferred_time text not null,notes text default '',status text not null default 'pending' check(status in ('pending','confirmed','rescheduled','declined','completed','cancelled')),confirmed_date date,confirmed_time text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists bookings_status_created_idx on public.bookings(status,created_at desc);
alter table public.bookings enable row level security;
-- Keep the service-role key server-side only. No public table policies are created.
