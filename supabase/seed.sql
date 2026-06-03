-- =============================================================================
-- Souqna — seed data
-- =============================================================================
-- Reference data (cities, categories) plus a small, realistic set of sellers
-- and listings so a fresh database mirrors the in-app mock content.
--
-- NOTE: profiles reference auth.users, so sellers here are seeded WITHOUT a
-- backing auth user (user_id is set to a fixed demo UUID). On a real project,
-- create the auth users first (or sign up through the app) and replace the
-- user_id values below. The app ships with local mocks, so this seed is for
-- a LOCAL Postgres where you can create matching auth users.
--
-- For a live dev/prod Supabase project, run supabase/seed_reference.sql
-- instead — it contains only cities + categories (no auth.users dependency).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Cities
-- -----------------------------------------------------------------------------
insert into cities (id, country_code, name_en, name_ar, postal_prefix) values
  ('damascus',    'SY', 'Damascus',    'دمشق',       '00'),
  ('aleppo',      'SY', 'Aleppo',      'حلب',        '02'),
  ('homs',        'SY', 'Homs',        'حمص',        '03'),
  ('hama',        'SY', 'Hama',        'حماة',       '04'),
  ('latakia',     'SY', 'Latakia',     'اللاذقية',   '05'),
  ('deir-ez-zor', 'SY', 'Deir ez-Zor', 'دير الزور',  '06')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
insert into categories (slug, icon, sort_order) values
  ('clothing',    'shirt-outline',                        1),
  ('electronics', 'phone-portrait-outline',               2),
  ('home',        'home-outline',                         3),
  ('beauty',      'sparkles-outline',                     4),
  ('kids',        'happy-outline',                        5),
  ('services',    'construct-outline',                    6),
  ('misc',        'ellipsis-horizontal-circle-outline',   7)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Demo seller profiles
-- -----------------------------------------------------------------------------
-- Fixed UUIDs so the seed is idempotent. user_id reuses the same UUID as a
-- placeholder; replace with real auth.users ids in production.
insert into seller_profiles
  (id, user_id, display_name, city_id, category_slugs, status, rating_avg, rating_count)
values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Sham Electronics · شام', 'damascus', '{electronics}', 'verified', 4.8, 126),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Amal Atelier · أمل', 'aleppo', '{clothing,beauty}', 'verified', 4.9, 84),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Bayt al-Dafa · بيت الدفء', 'latakia', '{home}', 'verified', 4.7, 53)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Demo listings
-- -----------------------------------------------------------------------------
insert into listings
  (id, seller_id, title, description, category_slug, price, currency, condition,
   city_id, delivery, pickup, status)
values
  ('aaaaaaa1-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'iPhone 13 — 128GB, excellent condition',
   'Battery health 92%. Includes original box and cable. No scratches.',
   'electronics', 520.00, 'USD', 'like_new', 'damascus', true, true, 'active'),
  ('aaaaaaa1-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222',
   'Hand-embroidered abaya — handmade',
   'Traditional Aleppo embroidery, premium fabric. Custom sizing available.',
   'clothing', 65.00, 'USD', 'new', 'aleppo', true, false, 'active'),
  ('aaaaaaa1-0000-0000-0000-000000000003',
   '33333333-3333-3333-3333-333333333333',
   'Olive-wood serving bowl set',
   'Set of three hand-carved bowls from local olive wood.',
   'home', 28.00, 'USD', 'new', 'latakia', false, true, 'active'),
  ('aaaaaaa1-0000-0000-0000-000000000004',
   '11111111-1111-1111-1111-111111111111',
   'Samsung 43" 4K Smart TV',
   'One year old, boxed, works perfectly. Pickup in Damascus.',
   'electronics', 310.00, 'USD', 'good', 'damascus', false, true, 'active')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Demo listing images
-- -----------------------------------------------------------------------------
insert into listing_images (listing_id, url, position) values
  ('aaaaaaa1-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800', 0),
  ('aaaaaaa1-0000-0000-0000-000000000002',
   'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 0),
  ('aaaaaaa1-0000-0000-0000-000000000003',
   'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800', 0),
  ('aaaaaaa1-0000-0000-0000-000000000004',
   'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', 0)
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Demo buyer profile
-- -----------------------------------------------------------------------------
-- Same caveat as sellers above: profiles references auth.users, so on a live
-- project create the auth user first (or sign up through the app) and replace
-- this id. Used as buyer_id for the demo orders below.
insert into profiles (id, full_name, email, city_id, postal_code) values
  ('bbbbbbb1-0000-0000-0000-000000000001', 'Layla H.', 'layla@example.com', 'damascus', '0010')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Demo orders + shipment tracking
-- -----------------------------------------------------------------------------
-- Covers a spread of lifecycle states. Couriers are entered manually as local
-- delivery companies (no global-carrier hardcoding); tracking_url alone is a
-- valid tracking signal.
insert into orders
  (id, reference, buyer_id, seller_id, city_id, subtotal, currency, status,
   estimated_delivery_at, delivered_at, issue_note, placed_at)
values
  -- preparing (no shipment yet)
  ('ccccccc1-0000-0000-0000-000000000001', 'SQ-2026-1001',
   'bbbbbbb1-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   'latakia', 28.00, 'USD', 'preparing',
   now() + interval '5 days', null, null, now() - interval '2 days'),
  -- out_for_delivery (manual local courier + tracking link)
  ('ccccccc1-0000-0000-0000-000000000002', 'SQ-2026-1003',
   'bbbbbbb1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'damascus', 520.00, 'USD', 'out_for_delivery',
   now() + interval '1 day', null, null, now() - interval '5 days'),
  -- delivered
  ('ccccccc1-0000-0000-0000-000000000003', 'SQ-2026-1004',
   'bbbbbbb1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'aleppo', 65.00, 'USD', 'delivered',
   now() - interval '1 day', now() - interval '1 day', null, now() - interval '9 days'),
  -- issue_reported (moderation-friendly: preserved, not deleted)
  ('ccccccc1-0000-0000-0000-000000000004', 'SQ-2026-1005',
   'bbbbbbb1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'damascus', 310.00, 'USD', 'issue_reported',
   null, null, 'Item arrived with a cracked screen. Requesting a replacement.',
   now() - interval '12 days')
on conflict (id) do nothing;

insert into order_items
  (order_id, listing_id, title, image_url, unit_price, currency, quantity)
values
  ('ccccccc1-0000-0000-0000-000000000001', 'aaaaaaa1-0000-0000-0000-000000000003',
   'Olive-wood serving bowl set', 'https://picsum.photos/seed/souqna-bowl-1/700/700', 28.00, 'USD', 1),
  ('ccccccc1-0000-0000-0000-000000000002', 'aaaaaaa1-0000-0000-0000-000000000001',
   'iPhone 13 — 128GB, excellent condition', 'https://picsum.photos/seed/souqna-iphone-1/700/700', 520.00, 'USD', 1),
  ('ccccccc1-0000-0000-0000-000000000003', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Hand-embroidered abaya — handmade', 'https://picsum.photos/seed/souqna-abaya-1/700/700', 65.00, 'USD', 1),
  ('ccccccc1-0000-0000-0000-000000000004', 'aaaaaaa1-0000-0000-0000-000000000004',
   'Samsung 43" 4K Smart TV', 'https://picsum.photos/seed/souqna-tv-1/700/700', 310.00, 'USD', 1)
on conflict do nothing;

insert into order_status_history (order_id, status, created_at) values
  ('ccccccc1-0000-0000-0000-000000000002', 'pending',          now() - interval '5 days'),
  ('ccccccc1-0000-0000-0000-000000000002', 'confirmed',        now() - interval '4 days'),
  ('ccccccc1-0000-0000-0000-000000000002', 'preparing',        now() - interval '4 days'),
  ('ccccccc1-0000-0000-0000-000000000002', 'shipped',          now() - interval '2 days'),
  ('ccccccc1-0000-0000-0000-000000000002', 'out_for_delivery', now() - interval '4 hours'),
  ('ccccccc1-0000-0000-0000-000000000004', 'pending',          now() - interval '12 days'),
  ('ccccccc1-0000-0000-0000-000000000004', 'confirmed',        now() - interval '11 days'),
  ('ccccccc1-0000-0000-0000-000000000004', 'shipped',          now() - interval '8 days'),
  ('ccccccc1-0000-0000-0000-000000000004', 'delivered',        now() - interval '6 days'),
  ('ccccccc1-0000-0000-0000-000000000004', 'issue_reported',   now() - interval '5 days')
on conflict do nothing;

insert into shipments
  (id, order_id, courier_name, provider_name, tracking_number, tracking_url,
   status, estimated_delivery_at, note_to_buyer)
values
  ('ddddddd1-0000-0000-0000-000000000002', 'ccccccc1-0000-0000-0000-000000000002',
   'Al-Fares Express', 'Al-Fares Logistics', 'AF-93817254',
   'https://track.alfares.example/AF-93817254', 'out_for_delivery',
   now() + interval '1 day', 'Driver will call before arriving. Please keep your phone reachable.')
on conflict (id) do nothing;

insert into shipment_updates (shipment_id, status, description, created_at) values
  ('ddddddd1-0000-0000-0000-000000000002', 'in_transit',       'Picked up from seller', now() - interval '2 days'),
  ('ddddddd1-0000-0000-0000-000000000002', 'out_for_delivery', 'Out for delivery in Damascus', now() - interval '4 hours')
on conflict do nothing;
