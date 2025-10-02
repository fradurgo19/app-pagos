/*
  Script de Configuración para PostgreSQL 17 Local
  Sistema de Gestión de Facturas - APPpagos
  
  INSTRUCCIONES:
  1. Asegúrate de tener PostgreSQL 17 instalado y corriendo
  2. Crea la base de datos: CREATE DATABASE apppagos;
  3. Ejecuta este script: psql -U postgres -d apppagos -f setup-local-postgres.sql
*/

-- ============================================
-- EXTENSIONES NECESARIAS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: profiles
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'basic_user' CHECK (role IN ('basic_user', 'area_coordinator')),
  department TEXT,
  location TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- TABLA: utility_bills
-- ============================================

CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer', 'other')),
  provider TEXT,
  description TEXT,
  value NUMERIC NOT NULL CHECK (value >= 0),
  period TEXT NOT NULL,
  invoice_number TEXT,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  consumption NUMERIC CHECK (consumption >= 0),
  unit_of_measure TEXT,
  cost_center TEXT,
  location TEXT NOT NULL,
  due_date DATE NOT NULL,
  document_url TEXT,
  document_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'overdue', 'paid')),
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON utility_bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON utility_bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON utility_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_location ON utility_bills(location);

-- ============================================
-- TABLA: budget_thresholds
-- ============================================

CREATE TABLE IF NOT EXISTS budget_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  location TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL CHECK (monthly_limit >= 0),
  warning_threshold NUMERIC NOT NULL DEFAULT 80 CHECK (warning_threshold > 0 AND warning_threshold <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_type, location)
);

-- ============================================
-- TABLA: notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES utility_bills(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('due_reminder', 'budget_alert', 'approval_request', 'bill_approved')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- TABLA: sessions (para manejo de sesiones)
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_utility_bills_updated_at ON utility_bills;
CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_thresholds_updated_at ON budget_thresholds;
CREATE TRIGGER update_budget_thresholds_updated_at
  BEFORE UPDATE ON budget_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Registrar Usuario
-- ============================================

CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_location TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Generar hash de contraseña
  v_password_hash := crypt(p_password, gen_salt('bf'));
  
  -- Insertar usuario
  INSERT INTO profiles (email, password_hash, full_name, location, role)
  VALUES (p_email, v_password_hash, p_full_name, p_location, 'basic_user')
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Verificar Credenciales
-- ============================================

CREATE OR REPLACE FUNCTION verify_credentials(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(user_id UUID, role TEXT, full_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, p.role, p.full_name
  FROM profiles p
  WHERE p.email = p_email
    AND p.password_hash = crypt(p_password, p.password_hash);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar usuario de prueba (password: admin123)
-- Descomenta las siguientes líneas si quieres datos de prueba

/*
INSERT INTO profiles (email, password_hash, full_name, role, location)
VALUES (
  'admin@apppagos.com',
  crypt('admin123', gen_salt('bf')),
  'Administrador Sistema',
  'area_coordinator',
  'Oficina Principal'
) ON CONFLICT (email) DO NOTHING;

-- Insertar umbrales de presupuesto de ejemplo
INSERT INTO budget_thresholds (service_type, location, monthly_limit, warning_threshold)
VALUES
  ('electricity', 'Oficina Principal', 5000000, 80),
  ('water', 'Oficina Principal', 1000000, 80),
  ('internet', 'Oficina Principal', 500000, 80)
ON CONFLICT (service_type, location) DO NOTHING;
*/

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar resumen de tablas creadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Mostrar mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos configurada correctamente';
  RAISE NOTICE '📊 Tablas creadas: profiles, utility_bills, budget_thresholds, notifications, sessions';
  RAISE NOTICE '🔧 Extensiones instaladas: uuid-ossp, pgcrypto';
  RAISE NOTICE '⚡ Índices y triggers configurados';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 La base de datos está lista para usar!';
END $$;

