-- Promover usuarios específicos al rol admin (area_coordinator)
-- Nota: este script actualiza usuarios existentes por email.
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
