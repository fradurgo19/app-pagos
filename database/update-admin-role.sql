/*
  Script para actualizar el rol del administrador
  Ejecutar con: psql -U postgres -d apppagos -f database/update-admin-role.sql
*/

-- Actualizar el rol del usuario admin a area_coordinator
UPDATE profiles 
SET role = 'area_coordinator' 
WHERE email = 'admin@apppagos.com';

-- Verificar el cambio
SELECT 
  email,
  full_name,
  role,
  location,
  department
FROM profiles
WHERE email = 'admin@apppagos.com';

-- Mostrar todos los usuarios y sus roles
SELECT 
  email,
  full_name,
  role,
  location
FROM profiles
ORDER BY role DESC, email;

-- Mensaje de confirmación
SELECT '✅ Usuario admin@apppagos.com actualizado a area_coordinator' AS status;

