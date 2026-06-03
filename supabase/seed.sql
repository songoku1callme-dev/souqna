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
-- when you wire up a live Supabase project.
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
