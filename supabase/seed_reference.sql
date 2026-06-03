-- =============================================================================
-- Souqna — reference seed data (safe for any live project)
-- =============================================================================
-- ONLY reference/lookup data that has no dependency on auth.users: cities and
-- categories. This is the file to run on a dev or production Supabase project
-- after schema.sql. It is idempotent (on conflict do nothing).
--
-- Demo sellers / listings / orders live in seed.sql and require backing
-- auth.users rows, so they are NOT included here (they cannot be inserted into
-- a live project without first creating the matching auth users).
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
