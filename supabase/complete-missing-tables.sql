-- Ejecutar en SQL Editor del Supabase DESTINO cuando solo existen profiles y notifications.
-- Crea utility_bills, budget_thresholds, bill_consumptions, funciones y ajustes finales.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- utility_bills (incluye contract_number)
CREATE TABLE IF NOT EXISTS utility_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
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
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'overdue', 'paid')),
  notes text,
  approved_by uuid REFERENCES profiles,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number text;

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON utility_bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON utility_bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON utility_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_location ON utility_bills(location);
CREATE INDEX IF NOT EXISTS idx_bills_city ON utility_bills(city);
CREATE INDEX IF NOT EXISTS idx_bills_business_group ON utility_bills(business_group);
CREATE INDEX IF NOT EXISTS idx_bills_city_location_group ON utility_bills(city, location, business_group);

DROP TRIGGER IF EXISTS update_utility_bills_updated_at ON utility_bills;
CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- budget_thresholds
CREATE TABLE IF NOT EXISTS budget_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  location text NOT NULL,
  monthly_limit numeric NOT NULL CHECK (monthly_limit >= 0),
  warning_threshold numeric NOT NULL DEFAULT 80 CHECK (warning_threshold > 0 AND warning_threshold <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_type, location)
);

DROP TRIGGER IF EXISTS update_budget_thresholds_updated_at ON budget_thresholds;
CREATE TRIGGER update_budget_thresholds_updated_at
  BEFORE UPDATE ON budget_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- bill_consumptions
CREATE TABLE IF NOT EXISTS bill_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES utility_bills(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN (
    'electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer',
    'cellular', 'security', 'administration', 'rent', 'other'
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

DROP TRIGGER IF EXISTS update_bill_consumptions_updated_at ON bill_consumptions;
CREATE TRIGGER update_bill_consumptions_updated_at
  BEFORE UPDATE ON bill_consumptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE utility_bills ALTER COLUMN service_type DROP NOT NULL;

-- Funciones de auth
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
DECLARE
  v_user_id uuid;
  v_password_hash text;
BEGIN
  v_password_hash := crypt(p_password, gen_salt('bf'));
  INSERT INTO profiles (email, password_hash, full_name, location, role)
  VALUES (p_email, v_password_hash, p_full_name, p_location, 'basic_user')
  RETURNING id INTO v_user_id;
  RETURN v_user_id;
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
    SELECT 1 FROM profiles
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
  FROM profiles p
  WHERE p.email = p_email
    AND p.password_hash = crypt(p_password, p.password_hash);
END;
$$;

GRANT EXECUTE ON FUNCTION register_user(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_password(text, text) TO anon, authenticated;

-- RPC bulk delete
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
  FROM public.profiles WHERE id = p_actor_id LIMIT 1;

  IF is_coordinator THEN
    RETURN QUERY DELETE FROM public.utility_bills WHERE id = ANY(id_arr) RETURNING id;
  ELSE
    RETURN QUERY DELETE FROM public.utility_bills
    WHERE user_id = p_actor_id AND id = ANY(id_arr) RETURNING id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO anon, authenticated, service_role;

-- Verificación
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'utility_bills', 'bill_consumptions', 'budget_thresholds', 'notifications')
ORDER BY table_name;
