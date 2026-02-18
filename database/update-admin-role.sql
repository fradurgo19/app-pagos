/*
  Script para actualizar el rol de administradores
  Ejecutar con: psql -U postgres -d apppagos -f database/update-admin-role.sql
*/

-- Correos que deben tener rol admin (area_coordinator)
UPDATE profiles
SET
  role = 'area_coordinator',
  updated_at = NOW()
WHERE LOWER(email) IN (
  'fherrera@partequipos.com',
  'contabilidad3@partequipos.com',
  'contabilidad4@partequipos.com',
  'analista.contabilidad1@partequipos.com'
);

-- Verificar cambios solo para estos correos
SELECT
  email,
  full_name,
  role,
  location,
  department
FROM profiles
WHERE LOWER(email) IN (
  'fherrera@partequipos.com',
  'contabilidad3@partequipos.com',
  'contabilidad4@partequipos.com',
  'analista.contabilidad1@partequipos.com'
)
ORDER BY email;

-- Mostrar resumen de usuarios admin
SELECT
  email,
  full_name,
  role,
  location
FROM profiles
WHERE role = 'area_coordinator'
ORDER BY email;

-- Mensaje de confirmación
SELECT '✅ Roles admin actualizados para usuarios de contabilidad y fherrera' AS status;

