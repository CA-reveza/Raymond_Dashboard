-- =========================================================
-- Intent-Based Movie Ticket Booking — Core Schema
-- Target: Supabase (Postgres + RLS)
-- Source: Axionik MarketplacePro project
-- (Restaurant reservations & retail orders schema not yet provided —
--  see server/src/routes/marketplace.js for the placeholder table names.)
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  state text,
  created_at timestamptz default now()
);

create table theatres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city_id uuid references cities(id) on delete restrict,
  address text,
  total_screens int default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table screens (
  id uuid primary key default gen_random_uuid(),
  theatre_id uuid references theatres(id) on delete cascade,
  screen_name text not null,
  total_seats int not null,
  seat_layout jsonb,
  created_at timestamptz default now()
);

create table movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text,
  genre text[],
  duration_minutes int,
  certificate text,
  release_date date,
  poster_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table shows (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references movies(id) on delete cascade,
  screen_id uuid references screens(id) on delete cascade,
  theatre_id uuid references theatres(id) on delete cascade,
  show_date date not null,
  show_time time not null,
  base_price numeric(10,2) not null,
  total_seats int not null,
  available_seats int not null,
  status text default 'scheduled',
  created_at timestamptz default now()
);

create table show_seats (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade,
  seat_label text not null,
  seat_type text default 'standard',
  price numeric(10,2) not null,
  status text default 'available',
  held_until timestamptz,
  unique (show_id, seat_label)
);

create table discounts (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  description text,
  discount_type text not null,
  value numeric(10,2) not null,
  max_discount_amount numeric(10,2),
  applicable_theatre_id uuid references theatres(id),
  valid_from timestamptz,
  valid_to timestamptz,
  is_active boolean default true
);

create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  show_id uuid references shows(id),
  seat_ids uuid[] not null,
  num_seats int not null,
  base_amount numeric(10,2) not null,
  discount_id uuid references discounts(id),
  discount_amount numeric(10,2) default 0,
  final_amount numeric(10,2) not null,
  status text default 'pending',
  source text default 'mcp',
  source_client text,
  payment_ref text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

-- RLS: bookings/app_users are locked to auth.uid() = user_id, which is why
-- the Shoppers Stop dashboard connects with the service_role key (bypasses
-- RLS) rather than the anon/publishable key.

-- =========================================================
-- RETAIL ORDERS (confirmed via CSV export, same DB/project)
-- =========================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  store_id uuid,
  line_items jsonb not null,       -- [{qty, unit_price, variant_id}, ...]
  base_amount numeric(10,2) not null,
  discount_id uuid references discounts(id),
  discount_amount numeric(10,2) default 0,
  final_amount numeric(10,2) not null,
  status text default 'pending',
  source text default 'mcp',
  source_client text,
  payment_ref text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

-- RESTAURANT RESERVATIONS: schema not yet provided. Likely follows the same
-- user_id -> app_users pattern as bookings/orders above.
