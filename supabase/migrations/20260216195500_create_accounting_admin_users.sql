-- Crear/actualizar usuarios admin de contabilidad en Supabase
-- Contraseña temporal fija: admin123
-- IMPORTANTE: cambiar contraseña luego del primer ingreso.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO profiles (email, password_hash, full_name, role, department, location)
VALUES
  (
    'contabilidad3@partequipos.com',
    crypt('admin123', gen_salt('bf')),
    'Contabilidad 3',
    'area_coordinator',
    'Contabilidad',
    'Oficina Principal'
  ),
  (
    'contabilidad4@partequipos.com',
    crypt('admin123', gen_salt('bf')),
    'Contabilidad 4',
    'area_coordinator',
    'Contabilidad',
    'Oficina Principal'
  ),
  (
    'analista.contabilidad1@partequipos.com',
    crypt('admin123', gen_salt('bf')),
    'Analista Contabilidad 1',
    'area_coordinator',
    'Contabilidad',
    'Oficina Principal'
  )
ON CONFLICT (email) DO UPDATE
SET
  password_hash = crypt('admin123', gen_salt('bf')),
  role = 'area_coordinator',
  department = COALESCE(profiles.department, EXCLUDED.department),
  location = COALESCE(profiles.location, EXCLUDED.location),
  full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
  updated_at = NOW();
