-- SCRIPT PARA SUPABASE (sin auth.users)
-- Ejecutar en SQL Editor de Supabase

-- Habilitar extensión para passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de perfiles/usuarios
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'basic_user' CHECK (role IN ('basic_user', 'area_coordinator')),
  department text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS utility_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  service_type text NOT NULL,
  provider text,
  description text,
  value numeric NOT NULL CHECK (value >= 0),
  period text NOT NULL,
  invoice_number text,
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

-- Tabla de umbrales de presupuesto
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

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  bill_id uuid REFERENCES utility_bills ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON utility_bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON utility_bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON utility_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_location ON utility_bills(location);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Function para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario admin por defecto
INSERT INTO profiles (email, password_hash, full_name, role, location, department)
VALUES (
  'admin@apppagos.com',
  crypt('admin123', gen_salt('bf')),
  'Admin Usuario',
  'area_coordinator',
  'Oficina Principal',
  'Administración'
) ON CONFLICT (email) DO NOTHING;

-- Función para verificar credenciales
CREATE OR REPLACE FUNCTION verify_credentials(p_email text, p_password text)
RETURNS TABLE (
  user_id uuid,
  role text,
  full_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, profiles.role, profiles.full_name
  FROM profiles
  WHERE profiles.email = p_email
    AND password_hash = crypt(p_password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar
SELECT 'Tablas y funciones creadas exitosamente' as status;
SELECT count(*) as total_usuarios FROM profiles;

