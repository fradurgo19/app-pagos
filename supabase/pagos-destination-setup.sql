-- =============================================================================
-- MÓDULO PAGOS — Supabase DESTINO (convive con profiles de otra app)
-- Ejecutar en SQL Editor de dsnowunofuxkxbinvknf (o proyecto destino).
-- Idempotente: seguro re-ejecutar si tablas/funciones ya existen.
--
-- NOTA: Si utility_bills ya existe con FK a pagos_profiles y datos migrados,
--       este script completa funciones y ajustes sin borrar datos.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. pagos_profiles (usuarios del módulo de pagos — NO usar profiles de otra app)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'basic_user'
    CHECK (role IN ('basic_user', 'area_coordinator')),
  department text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_profiles_email ON pagos_profiles(email);
CREATE INDEX IF NOT EXISTS idx_pagos_profiles_role ON pagos_profiles(role);

-- -----------------------------------------------------------------------------
-- 2. utility_bills (solo si no existe; si ya migró, se omiten columnas existentes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utility_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text,
  provider text,
  description text,
  value numeric NOT NULL CHECK (value >= 0),
  period text NOT NULL,
  invoice_number text,
  contract_number text,
  city text,
  business_group text,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  consumption numeric CHECK (consumption >= 0),
  unit_of_measure text,
  cost_center text,
  location text NOT NULL,
  due_date date NOT NULL,
  document_url text,
  document_name text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'overdue', 'paid')),
  notes text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number text;
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS business_group text;
ALTER TABLE utility_bills ALTER COLUMN service_type DROP NOT NULL;

-- FK user_id → pagos_profiles (solo si aún no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'utility_bills_user_id_fkey'
  ) THEN
    ALTER TABLE utility_bills
      ADD CONSTRAINT utility_bills_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES pagos_profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE NOTICE 'utility_bills_user_id_fkey: hay user_id sin match en pagos_profiles. Corregir datos antes de FK.';
END $$;

-- FK approved_by → pagos_profiles (opcional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'utility_bills_approved_by_fkey'
  ) THEN
    ALTER TABLE utility_bills
      ADD CONSTRAINT utility_bills_approved_by_fkey
      FOREIGN KEY (approved_by) REFERENCES pagos_profiles(id);
  END IF;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE NOTICE 'utility_bills_approved_by_fkey: approved_by inválidos. Omitiendo o corregir datos.';
END $$;

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON utility_bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON utility_bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON utility_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_location ON utility_bills(location);
CREATE INDEX IF NOT EXISTS idx_bills_city ON utility_bills(city);
CREATE INDEX IF NOT EXISTS idx_bills_business_group ON utility_bills(business_group);
CREATE INDEX IF NOT EXISTS idx_bills_city_location_group ON utility_bills(city, location, business_group);

-- -----------------------------------------------------------------------------
-- 3. bill_consumptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bill_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES utility_bills(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN (
    'electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer',
    'cellular', 'security', 'administration', 'rent', 'other', 'public_lighting'
  )),
  provider text NOT NULL,
  period_from date NOT NULL,
  period_to date NOT NULL,
  value numeric NOT NULL CHECK (value >= 0),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  consumption numeric,
  unit_of_measure text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bill_consumptions_bill_id ON bill_consumptions(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_consumptions_service_type ON bill_consumptions(service_type);
CREATE INDEX IF NOT EXISTS idx_bill_consumptions_period ON bill_consumptions(period_from, period_to);

-- -----------------------------------------------------------------------------
-- 4. budget_thresholds (opcional)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budget_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  location text NOT NULL,
  monthly_limit numeric NOT NULL CHECK (monthly_limit >= 0),
  warning_threshold numeric NOT NULL DEFAULT 80
    CHECK (warning_threshold > 0 AND warning_threshold <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_type, location)
);

-- -----------------------------------------------------------------------------
-- 5. Triggers updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pagos_profiles_updated_at ON pagos_profiles;
CREATE TRIGGER update_pagos_profiles_updated_at
  BEFORE UPDATE ON pagos_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_utility_bills_updated_at ON utility_bills;
CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bill_consumptions_updated_at ON bill_consumptions;
CREATE TRIGGER update_bill_consumptions_updated_at
  BEFORE UPDATE ON bill_consumptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_thresholds_updated_at ON budget_thresholds;
CREATE TRIGGER update_budget_thresholds_updated_at
  BEFORE UPDATE ON budget_thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. Auth pagos — funciones sobre pagos_profiles (NO profiles)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION register_pagos_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_location text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_password_hash text;
BEGIN
  v_password_hash := crypt(p_password, gen_salt('bf'));
  INSERT INTO pagos_profiles (email, password_hash, full_name, location, role)
  VALUES (p_email, v_password_hash, p_full_name, p_location, 'basic_user')
  RETURNING id INTO v_user_id;
  RETURN v_user_id;
END;
$$;

-- Alias compatible con backend APPpagos (register_user → pagos_profiles)
CREATE OR REPLACE FUNCTION register_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_location text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN register_pagos_user(p_email, p_password, p_full_name, p_location);
END;
$$;

CREATE OR REPLACE FUNCTION check_password(user_email text, user_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pagos_profiles
    WHERE email = user_email
      AND password_hash = crypt(user_password, password_hash)
  );
END;
$$;

CREATE OR REPLACE FUNCTION verify_credentials(p_email text, p_password text)
RETURNS TABLE (user_id uuid, role text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.role, p.full_name
  FROM pagos_profiles p
  WHERE p.email = p_email
    AND p.password_hash = crypt(p_password, p.password_hash);
END;
$$;

GRANT EXECUTE ON FUNCTION register_pagos_user(text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION register_user(text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_password(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION verify_credentials(text, text) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 7. Bulk delete — usa pagos_profiles para rol coordinador
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, uuid[]);
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, text[]);

CREATE OR REPLACE FUNCTION public.bulk_delete_utility_bills(p_actor_id uuid, p_ids text[])
RETURNS TABLE(deleted_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_coordinator boolean;
  id_arr uuid[];
BEGIN
  id_arr := ARRAY(SELECT (unnest(p_ids))::uuid);

  SELECT (role = 'area_coordinator') INTO is_coordinator
  FROM public.pagos_profiles WHERE id = p_actor_id LIMIT 1;

  IF is_coordinator THEN
    RETURN QUERY DELETE FROM public.utility_bills WHERE id = ANY(id_arr) RETURNING id;
  ELSE
    RETURN QUERY DELETE FROM public.utility_bills
    WHERE user_id = p_actor_id AND id = ANY(id_arr) RETURNING id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8. Storage bucket invoices (crear si no existe — dashboard o API)
-- En SQL Editor no siempre está disponible; verificar en Storage UI:
--   Bucket: invoices | Public: true
-- Política lectura pública ejemplo (ajustar según necesidad):
-- -----------------------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('invoices', 'invoices', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- -----------------------------------------------------------------------------
-- 9. Verificación
-- -----------------------------------------------------------------------------
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'pagos_profiles', 'utility_bills', 'bill_consumptions', 'budget_thresholds'
  )
ORDER BY table_name;

SELECT 'pagos_profiles' AS tabla, COUNT(*)::text AS filas FROM pagos_profiles
UNION ALL SELECT 'utility_bills', COUNT(*)::text FROM utility_bills
UNION ALL SELECT 'bill_consumptions', COUNT(*)::text FROM bill_consumptions;

SELECT COUNT(*) AS bills_sin_usuario
FROM utility_bills b
LEFT JOIN pagos_profiles p ON p.id = b.user_id
WHERE p.id IS NULL;

SELECT COUNT(*) AS consumos_huerfanos
FROM bill_consumptions c
LEFT JOIN utility_bills b ON b.id = c.bill_id
WHERE b.id IS NULL;
