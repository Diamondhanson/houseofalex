-- House of Alex — database schema + Row Level Security (RLS)
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Security model:
--   * Browser (anon key) may ONLY read the active public catalogue.
--   * All writes (orders, enquiries, admin CRUD) go through the Next.js server
--     using the service-role key, AFTER server-side validation.
--   * RLS is enabled on every table so a leaked anon key cannot read orders,
--     write pallets, or tamper with prices.

-- ============================ TABLES ============================

create table if not exists categories (
  id          text primary key,
  label       text not null,
  tagline     text,
  image       text,
  created_at  timestamptz not null default now()
);

create table if not exists pallets (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category_id text references categories(id) on delete set null,
  pieces      int  not null check (pieces > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  price       numeric(10,2) not null check (price >= 0),
  brands      text[] not null default '{}',
  condition   text,
  images      text[] not null default '{}' check (cardinality(images) <= 4),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null,
  company       text not null,
  contact_name  text not null,
  email         text not null,
  phone         text,
  vat_number    text,
  address_line1 text,
  city          text,
  postcode      text,
  country       text,
  notes         text,
  total_pallets int not null,
  total_units   int not null,
  total_cost    numeric(12,2) not null,
  status        text not null default 'pending'
                check (status in ('pending','invoiced','paid','dispatched','cancelled')),
  created_at    timestamptz not null default now()
);

create table if not exists order_lines (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references orders(id) on delete cascade,
  pallet_id  uuid references pallets(id),
  name       text not null,
  pieces     int  not null,
  unit_price numeric(10,2) not null,
  quantity   int  not null check (quantity > 0),
  line_total numeric(12,2) not null
);

create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- Allowlist of admin users (link to Supabase Auth users).
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ====================== ENABLE RLS (all) ======================

alter table categories       enable row level security;
alter table pallets          enable row level security;
alter table orders           enable row level security;
alter table order_lines      enable row level security;
alter table contact_messages enable row level security;
alter table admins           enable row level security;

-- Is the current authenticated user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ========================== POLICIES ==========================

-- Public read-only catalogue (active rows only). No anon writes anywhere.
drop policy if exists "public read categories" on categories;
create policy "public read categories"
  on categories for select using (true);

drop policy if exists "public read active pallets" on pallets;
create policy "public read active pallets"
  on pallets for select using (active = true);

-- Admins (signed in + in the admins table) may do everything.
drop policy if exists "admin manage categories" on categories;
create policy "admin manage categories"
  on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "admin manage pallets" on pallets;
create policy "admin manage pallets"
  on pallets for all using (is_admin()) with check (is_admin());

drop policy if exists "admin manage orders" on orders;
create policy "admin manage orders"
  on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "admin manage order_lines" on order_lines;
create policy "admin manage order_lines"
  on order_lines for all using (is_admin()) with check (is_admin());

drop policy if exists "admin manage contact" on contact_messages;
create policy "admin manage contact"
  on contact_messages for all using (is_admin()) with check (is_admin());

-- IMPORTANT: there are deliberately NO anon INSERT policies on `orders`,
-- `order_lines` or `contact_messages`. Those rows are written server-side with
-- the service-role key (which bypasses RLS) only after the server has
-- validated input and RECOMPUTED prices from the `pallets` table. This stops
-- clients from forging orders or tampering with totals at the database level.

-- After running this, grant yourself admin:
--   insert into admins (user_id) values ('<your-auth-user-uuid>');
