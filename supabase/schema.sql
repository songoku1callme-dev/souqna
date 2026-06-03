-- =============================================================================
-- Souqna — Postgres / Supabase schema
-- =============================================================================
-- This file is an RLS-aware schema proposal for the Souqna marketplace MVP.
-- It is designed to be run on a fresh Supabase project (Postgres 15+).
--
-- Conventions:
--   * UUID primary keys, defaulting to gen_random_uuid().
--   * created_at / updated_at timestamptz on mutable tables.
--   * Enums model the same states used in the app's TypeScript types
--     (see src/types/index.ts).
--   * Row Level Security (RLS) is enabled on every user-facing table, with
--     policies that assume Supabase Auth (auth.uid()).
--   * Moderation-friendly: listings/users carry status + flag fields and a
--     dedicated reports table; an `is_admin()` helper gates moderator access.
--
-- Run order: extensions → enums → helper functions → tables → indexes →
-- triggers → RLS policies → storage. Seed data lives in seed.sql.
-- =============================================================================

-- Helper functions (e.g. is_admin) are defined before the tables they query,
-- so defer function-body validation until the whole script has run. This is
-- the same approach pg_dump uses and lets this file apply cleanly in one pass.
set check_function_bodies = off;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- fuzzy search on listings

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('buyer', 'seller', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type seller_status as enum ('not_submitted', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_condition as enum ('new', 'like_new', 'good', 'used');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('draft', 'active', 'sold', 'removed', 'under_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason as enum ('spam', 'prohibited', 'scam', 'offensive', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_target_type as enum ('listing', 'user', 'conversation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Helper functions
-- -----------------------------------------------------------------------------
-- Keeps updated_at fresh on UPDATE.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- True when the calling user has the 'admin' role. Used by moderation policies.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- cities  (reference data; publicly readable)
-- -----------------------------------------------------------------------------
create table if not exists cities (
  id            text primary key,
  country_code  text not null,
  name_en       text not null,
  name_ar       text not null,
  postal_prefix text,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- categories  (reference data; publicly readable)
-- -----------------------------------------------------------------------------
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  icon       text not null,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text,
  avatar_url  text,
  city_id     text references cities (id) on delete set null,
  postal_code text,
  is_banned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- user_roles  (a user can hold multiple roles: buyer/seller/admin)
-- -----------------------------------------------------------------------------
create table if not exists user_roles (
  user_id    uuid not null references profiles (id) on delete cascade,
  role       user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- -----------------------------------------------------------------------------
-- seller_profiles  (public-facing seller storefront; 1:1 with a user)
-- -----------------------------------------------------------------------------
create table if not exists seller_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references profiles (id) on delete cascade,
  display_name  text not null,
  legal_name    text,
  phone         text,
  email         text,
  city_id       text references cities (id) on delete set null,
  postal_code   text,
  category_slugs text[] not null default '{}',
  status        seller_status not null default 'not_submitted',
  rating_avg    numeric(2,1),
  rating_count  int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- seller_verification_requests  (moderation queue; private to user + admins)
-- -----------------------------------------------------------------------------
create table if not exists seller_verification_requests (
  id                  uuid primary key default gen_random_uuid(),
  seller_profile_id   uuid not null references seller_profiles (id) on delete cascade,
  user_id             uuid not null references profiles (id) on delete cascade,
  legal_name          text,
  id_document_path    text,         -- storage path in the private bucket
  document_paths      text[] not null default '{}',
  accepted_terms      boolean not null default false,
  status              seller_status not null default 'pending',
  reviewer_id         uuid references profiles (id) on delete set null,
  reviewer_notes      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- listings
-- -----------------------------------------------------------------------------
create table if not exists listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references seller_profiles (id) on delete cascade,
  title         text not null,
  description   text not null default '',
  category_slug text not null references categories (slug),
  price         numeric(12,2) not null check (price >= 0),
  currency      text not null default 'USD',
  condition     listing_condition not null default 'used',
  city_id       text references cities (id) on delete set null,
  postal_code   text,
  delivery      boolean not null default false,
  pickup        boolean not null default true,
  status        listing_status not null default 'draft',
  -- Moderation
  is_flagged    boolean not null default false,
  flagged_count int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- listing_images
-- -----------------------------------------------------------------------------
create table if not exists listing_images (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  url        text not null,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- favorites  (buyer ↔ listing)
-- -----------------------------------------------------------------------------
create table if not exists favorites (
  user_id    uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- -----------------------------------------------------------------------------
-- conversations  (1 per buyer↔seller↔listing thread)
-- -----------------------------------------------------------------------------
create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references listings (id) on delete set null,
  buyer_id        uuid not null references profiles (id) on delete cascade,
  seller_id       uuid not null references profiles (id) on delete cascade,
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id       uuid not null references profiles (id) on delete cascade,
  body            text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- reports  (user-generated moderation signal)
-- -----------------------------------------------------------------------------
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid references profiles (id) on delete set null,
  target_type   report_target_type not null,
  target_id     text not null,
  reason        report_reason not null,
  details       text,
  status        report_status not null default 'open',
  reviewer_id   uuid references profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- blocked_users
-- -----------------------------------------------------------------------------
create table if not exists blocked_users (
  blocker_id uuid not null references profiles (id) on delete cascade,
  blocked_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_listings_status        on listings (status);
create index if not exists idx_listings_category       on listings (category_slug);
create index if not exists idx_listings_city           on listings (city_id);
create index if not exists idx_listings_seller         on listings (seller_id);
create index if not exists idx_listings_created_at     on listings (created_at desc);
create index if not exists idx_listings_title_trgm     on listings using gin (title gin_trgm_ops);
create index if not exists idx_listing_images_listing  on listing_images (listing_id);
create index if not exists idx_messages_conversation   on messages (conversation_id, created_at);
create index if not exists idx_conversations_buyer     on conversations (buyer_id);
create index if not exists idx_conversations_seller    on conversations (seller_id);
create index if not exists idx_reports_status          on reports (status);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'seller_profiles', 'seller_verification_requests', 'listings'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on %1$s;
       create trigger trg_%1$s_updated_at before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- Auto-create a profile + buyer role when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;

  insert into user_roles (user_id, role)
  values (new.id, 'buyer')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table profiles                       enable row level security;
alter table user_roles                     enable row level security;
alter table seller_profiles                enable row level security;
alter table seller_verification_requests   enable row level security;
alter table cities                         enable row level security;
alter table categories                     enable row level security;
alter table listings                       enable row level security;
alter table listing_images                 enable row level security;
alter table favorites                      enable row level security;
alter table conversations                  enable row level security;
alter table messages                       enable row level security;
alter table reports                        enable row level security;
alter table blocked_users                  enable row level security;

-- Reference data: world-readable.
create policy "cities are public"     on cities     for select using (true);
create policy "categories are public" on categories for select using (true);

-- profiles: anyone can read basic profiles; users edit their own; admins all.
create policy "profiles readable"        on profiles for select using (true);
create policy "profiles self update"     on profiles for update using (auth.uid() = id);
create policy "profiles admin manage"    on profiles for all    using (is_admin());

-- user_roles: a user reads their own roles; admins manage all.
create policy "roles self read"   on user_roles for select using (auth.uid() = user_id or is_admin());
create policy "roles admin write" on user_roles for all    using (is_admin());

-- seller_profiles: public read; owner inserts/updates own; admins manage.
create policy "sellers public read"  on seller_profiles for select using (true);
create policy "sellers self insert"  on seller_profiles for insert with check (auth.uid() = user_id);
create policy "sellers self update"  on seller_profiles for update using (auth.uid() = user_id);
create policy "sellers admin manage" on seller_profiles for all    using (is_admin());

-- verification requests: visible only to the owner and admins.
create policy "verif self read"    on seller_verification_requests
  for select using (auth.uid() = user_id or is_admin());
create policy "verif self insert"  on seller_verification_requests
  for insert with check (auth.uid() = user_id);
create policy "verif admin manage" on seller_verification_requests
  for all using (is_admin());

-- listings: active listings are public; sellers manage their own; admins all.
create policy "listings public read" on listings
  for select using (
    status = 'active'
    or is_admin()
    or seller_id in (select id from seller_profiles where user_id = auth.uid())
  );
create policy "listings seller insert" on listings
  for insert with check (
    seller_id in (select id from seller_profiles where user_id = auth.uid())
  );
create policy "listings seller update" on listings
  for update using (
    seller_id in (select id from seller_profiles where user_id = auth.uid())
  );
create policy "listings admin manage" on listings for all using (is_admin());

-- listing_images: readable when the parent listing is; writable by its seller.
create policy "images read" on listing_images
  for select using (
    exists (select 1 from listings l where l.id = listing_id
            and (l.status = 'active' or is_admin()
                 or l.seller_id in (select id from seller_profiles where user_id = auth.uid())))
  );
create policy "images seller write" on listing_images
  for all using (
    exists (select 1 from listings l
            join seller_profiles s on s.id = l.seller_id
            where l.id = listing_id and s.user_id = auth.uid())
  );

-- favorites: strictly per-user.
create policy "favorites self" on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations: visible to the two participants (or admins).
create policy "conversations participants" on conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id or is_admin());
create policy "conversations create" on conversations
  for insert with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- messages: readable/writable by conversation participants.
create policy "messages participants read" on messages
  for select using (
    exists (select 1 from conversations c where c.id = conversation_id
            and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id or is_admin()))
  );
create policy "messages participants send" on messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from conversations c where c.id = conversation_id
      and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id)
    )
  );

-- reports: a user creates reports and reads their own; admins read/manage all.
create policy "reports self read"   on reports for select using (auth.uid() = reporter_id or is_admin());
create policy "reports create"      on reports for insert with check (auth.uid() = reporter_id);
create policy "reports admin manage" on reports for all using (is_admin());

-- blocked_users: each user manages their own block list.
create policy "blocks self" on blocked_users
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- =============================================================================
-- Storage buckets (run via Supabase Storage or SQL with the storage schema)
-- =============================================================================
-- Public bucket for listing photos, private bucket for verification documents.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

-- Anyone can view listing images; authenticated users upload to their own folder.
create policy "listing images public read" on storage.objects
  for select using (bucket_id = 'listing-images');
create policy "listing images auth write" on storage.objects
  for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

-- Verification docs: only the owning user (folder = their uid) and admins.
create policy "verification docs owner read" on storage.objects
  for select using (
    bucket_id = 'verification-docs'
    and (split_part(name, '/', 1) = auth.uid()::text or is_admin())
  );
create policy "verification docs owner write" on storage.objects
  for insert with check (
    bucket_id = 'verification-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- =============================================================================
-- Orders & shipment tracking
-- =============================================================================
-- Buyers place orders against a seller's listings; sellers manage fulfilment
-- and attach shipment/tracking info. Local-courier friendly: courier_name,
-- provider_name, tracking_number and tracking_url are all free-text/nullable so
-- any regional delivery company works without a global-carrier API. Enum values
-- mirror the app's TypeScript types in src/types/index.ts.

-- Order lifecycle. cancelled/issue_reported are terminal off-ramps; the latter
-- keeps order flows moderation-friendly (the order is preserved, not deleted).
do $$ begin
  create type order_status as enum (
    'pending', 'confirmed', 'preparing', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled', 'issue_reported'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type shipment_status as enum (
    'pending', 'in_transit', 'out_for_delivery', 'delivered', 'exception'
  );
exception when duplicate_object then null; end $$;

-- orders: one row per buyer purchase from a single seller.
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  reference             text not null unique,            -- human-friendly, e.g. SQ-2026-0008
  buyer_id              uuid not null references profiles (id) on delete cascade,
  seller_id             uuid not null references seller_profiles (id) on delete cascade,
  city_id               text references cities (id) on delete set null,
  subtotal              numeric(12, 2) not null default 0,
  currency              text not null default 'USD',
  status                order_status not null default 'pending',
  estimated_delivery_at timestamptz,
  delivered_at          timestamptz,
  issue_note            text,                            -- buyer-raised issue (moderation-friendly)
  placed_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- order_items: line items snapshotting listing data at purchase time.
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders (id) on delete cascade,
  listing_id  uuid references listings (id) on delete set null,
  title       text not null,
  image_url   text,
  unit_price  numeric(12, 2) not null default 0,
  currency    text not null default 'USD',
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now()
);

-- order_status_history: append-only audit trail of order status transitions.
create table if not exists order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders (id) on delete cascade,
  status     order_status not null,
  note       text,
  created_at timestamptz not null default now()
);

-- shipments: 1:1-ish with an order (a seller may re-issue, latest wins in UI).
create table if not exists shipments (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders (id) on delete cascade,
  courier_name          text,                  -- manual local courier (no hardcoded carrier)
  provider_name         text,                  -- optional shipping provider/brand
  tracking_number       text,
  tracking_url          text,                  -- may be the only tracking signal available
  status                shipment_status not null default 'pending',
  estimated_delivery_at timestamptz,
  delivered_at          timestamptz,
  note_to_buyer         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- shipment_updates: append-only scan/status history for a shipment.
create table if not exists shipment_updates (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments (id) on delete cascade,
  status      shipment_status not null,
  description text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_orders_buyer    on orders (buyer_id, updated_at desc);
create index if not exists idx_orders_seller   on orders (seller_id, updated_at desc);
create index if not exists idx_order_items_ord on order_items (order_id);
create index if not exists idx_order_hist_ord  on order_status_history (order_id, created_at);
create index if not exists idx_shipments_ord   on shipments (order_id);
create index if not exists idx_ship_updates    on shipment_updates (shipment_id, created_at);

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

drop trigger if exists trg_shipments_updated_at on shipments;
create trigger trg_shipments_updated_at before update on shipments
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders RLS
-- -----------------------------------------------------------------------------
alter table orders               enable row level security;
alter table order_items          enable row level security;
alter table order_status_history enable row level security;
alter table shipments            enable row level security;
alter table shipment_updates     enable row level security;

-- An order is visible to its buyer, its seller, or an admin.
-- Seller match resolves seller_profiles.user_id = auth.uid().
create policy "orders buyer or seller read" on orders
  for select using (
    auth.uid() = buyer_id
    or seller_id in (select id from seller_profiles where user_id = auth.uid())
    or is_admin()
  );
-- Buyers create their own orders.
create policy "orders buyer create" on orders
  for insert with check (auth.uid() = buyer_id);
-- Buyers may update their own order (e.g. raise an issue); sellers update orders
-- they fulfil (status, ETA); admins manage all.
create policy "orders buyer update" on orders
  for update using (auth.uid() = buyer_id);
create policy "orders seller update" on orders
  for update using (
    seller_id in (select id from seller_profiles where user_id = auth.uid())
  );
create policy "orders admin manage" on orders for all using (is_admin());

-- Child rows inherit visibility from their parent order.
create policy "order_items read" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id
            and (auth.uid() = o.buyer_id
                 or o.seller_id in (select id from seller_profiles where user_id = auth.uid())
                 or is_admin()))
  );
create policy "order_items seller write" on order_items
  for all using (
    exists (select 1 from orders o where o.id = order_id
            and o.seller_id in (select id from seller_profiles where user_id = auth.uid()))
  );

create policy "order_status_history read" on order_status_history
  for select using (
    exists (select 1 from orders o where o.id = order_id
            and (auth.uid() = o.buyer_id
                 or o.seller_id in (select id from seller_profiles where user_id = auth.uid())
                 or is_admin()))
  );
create policy "order_status_history write" on order_status_history
  for insert with check (
    exists (select 1 from orders o where o.id = order_id
            and (auth.uid() = o.buyer_id
                 or o.seller_id in (select id from seller_profiles where user_id = auth.uid())))
  );

create policy "shipments read" on shipments
  for select using (
    exists (select 1 from orders o where o.id = order_id
            and (auth.uid() = o.buyer_id
                 or o.seller_id in (select id from seller_profiles where user_id = auth.uid())
                 or is_admin()))
  );
-- Only the fulfilling seller (or admin) can attach/update shipment + tracking.
create policy "shipments seller write" on shipments
  for all using (
    exists (select 1 from orders o where o.id = order_id
            and o.seller_id in (select id from seller_profiles where user_id = auth.uid()))
    or is_admin()
  );

create policy "shipment_updates read" on shipment_updates
  for select using (
    exists (select 1 from shipments s
            join orders o on o.id = s.order_id
            where s.id = shipment_id
            and (auth.uid() = o.buyer_id
                 or o.seller_id in (select id from seller_profiles where user_id = auth.uid())
                 or is_admin()))
  );
create policy "shipment_updates seller write" on shipment_updates
  for all using (
    exists (select 1 from shipments s
            join orders o on o.id = s.order_id
            where s.id = shipment_id
            and o.seller_id in (select id from seller_profiles where user_id = auth.uid()))
    or is_admin()
  );
