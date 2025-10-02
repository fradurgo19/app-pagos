/*
  Datos de Prueba para APPpagos
  PostgreSQL 17 Local
  
  ADVERTENCIA: Solo usar en desarrollo
  NO ejecutar en producción
*/

-- ============================================
-- USUARIOS DE PRUEBA
-- ============================================

-- Usuario Admin (Coordinador de Área)
-- Email: admin@apppagos.com
-- Password: admin123
INSERT INTO profiles (email, password_hash, full_name, role, location, department)
VALUES (
  'admin@apppagos.com',
  crypt('admin123', gen_salt('bf')),
  'Juan Administrador',
  'area_coordinator',
  'Oficina Bogotá',
  'Administración'
) ON CONFLICT (email) DO NOTHING;

-- Usuario Básico 1
-- Email: usuario1@apppagos.com
-- Password: user123
INSERT INTO profiles (email, password_hash, full_name, role, location, department)
VALUES (
  'usuario1@apppagos.com',
  crypt('user123', gen_salt('bf')),
  'María García',
  'basic_user',
  'Oficina Bogotá',
  'Contabilidad'
) ON CONFLICT (email) DO NOTHING;

-- Usuario Básico 2
-- Email: usuario2@apppagos.com
-- Password: user123
INSERT INTO profiles (email, password_hash, full_name, role, location, department)
VALUES (
  'usuario2@apppagos.com',
  crypt('user123', gen_salt('bf')),
  'Carlos Rodríguez',
  'basic_user',
  'Oficina Medellín',
  'TI'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- UMBRALES DE PRESUPUESTO
-- ============================================

INSERT INTO budget_thresholds (service_type, location, monthly_limit, warning_threshold)
VALUES
  ('electricity', 'Oficina Bogotá', 5000000, 80),
  ('water', 'Oficina Bogotá', 1000000, 80),
  ('gas', 'Oficina Bogotá', 800000, 80),
  ('internet', 'Oficina Bogotá', 500000, 80),
  ('phone', 'Oficina Bogotá', 300000, 80),
  ('electricity', 'Oficina Medellín', 4000000, 80),
  ('water', 'Oficina Medellín', 800000, 80),
  ('internet', 'Oficina Medellín', 400000, 80)
ON CONFLICT (service_type, location) DO NOTHING;

-- ============================================
-- FACTURAS DE EJEMPLO
-- ============================================

-- Obtener IDs de usuarios
DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_user1_id FROM profiles WHERE email = 'usuario1@apppagos.com';
  SELECT id INTO v_user2_id FROM profiles WHERE email = 'usuario2@apppagos.com';
  SELECT id INTO v_admin_id FROM profiles WHERE email = 'admin@apppagos.com';

  -- Facturas de Usuario 1 (María)
  INSERT INTO utility_bills (
    user_id, service_type, provider, description, value, period,
    invoice_number, total_amount, consumption, unit_of_measure,
    cost_center, location, due_date, status
  ) VALUES
  -- Mes actual
  (v_user1_id, 'electricity', 'Codensa', 'Consumo mensual de energía', 450000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'ELEC-2024-001', 450000, 580, 'kWh', 'Contabilidad', 'Oficina Bogotá',
   CURRENT_DATE + INTERVAL '15 days', 'pending'),
   
  (v_user1_id, 'water', 'EAAB', 'Servicio de acueducto', 85000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'AGUA-2024-001', 85000, 45, 'm³', 'Contabilidad', 'Oficina Bogotá',
   CURRENT_DATE + INTERVAL '10 days', 'pending'),
   
  (v_user1_id, 'internet', 'Claro', 'Fibra óptica 500 Mbps', 120000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'INT-2024-001', 120000, 500, 'GB', 'Contabilidad', 'Oficina Bogotá',
   CURRENT_DATE + INTERVAL '20 days', 'approved'),

  -- Mes anterior
  (v_user1_id, 'electricity', 'Codensa', 'Consumo mensual de energía', 420000, TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM'),
   'ELEC-2023-012', 420000, 550, 'kWh', 'Contabilidad', 'Oficina Bogotá',
   CURRENT_DATE - INTERVAL '1 month' + INTERVAL '15 days', 'paid'),
   
  (v_user1_id, 'water', 'EAAB', 'Servicio de acueducto', 78000, TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM'),
   'AGUA-2023-012', 78000, 42, 'm³', 'Contabilidad', 'Oficina Bogotá',
   CURRENT_DATE - INTERVAL '1 month' + INTERVAL '10 days', 'paid');

  -- Facturas de Usuario 2 (Carlos)
  INSERT INTO utility_bills (
    user_id, service_type, provider, description, value, period,
    invoice_number, total_amount, consumption, unit_of_measure,
    cost_center, location, due_date, status
  ) VALUES
  (v_user2_id, 'electricity', 'EPM', 'Consumo mensual de energía', 380000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'ELEC-MDE-001', 380000, 490, 'kWh', 'TI', 'Oficina Medellín',
   CURRENT_DATE + INTERVAL '12 days', 'pending'),
   
  (v_user2_id, 'internet', 'Une', 'Internet empresarial 1 Gbps', 250000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'INT-MDE-001', 250000, 1000, 'GB', 'TI', 'Oficina Medellín',
   CURRENT_DATE + INTERVAL '25 days', 'pending'),
   
  (v_user2_id, 'phone', 'Movistar', 'Plan corporativo', 150000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'TEL-MDE-001', 150000, 500, 'minutes', 'TI', 'Oficina Medellín',
   CURRENT_DATE + INTERVAL '18 days', 'draft');

  -- Facturas del Admin
  INSERT INTO utility_bills (
    user_id, service_type, provider, description, value, period,
    invoice_number, total_amount, consumption, unit_of_measure,
    cost_center, location, due_date, status, approved_by, approved_at
  ) VALUES
  (v_admin_id, 'gas', 'Gas Natural', 'Gas natural domiciliario', 65000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   'GAS-BOG-001', 65000, 18, 'm³', 'Administración', 'Oficina Bogotá',
   CURRENT_DATE + INTERVAL '8 days', 'approved', v_admin_id, NOW());

END $$;

-- ============================================
-- NOTIFICACIONES DE EJEMPLO
-- ============================================

DO $$
DECLARE
  v_user1_id UUID;
  v_bill_id UUID;
BEGIN
  SELECT id INTO v_user1_id FROM profiles WHERE email = 'usuario1@apppagos.com';
  SELECT id INTO v_bill_id FROM utility_bills WHERE invoice_number = 'ELEC-2024-001' LIMIT 1;

  INSERT INTO notifications (user_id, bill_id, type, message, read)
  VALUES
  (v_user1_id, v_bill_id, 'due_reminder', 'Tu factura de electricidad vence en 15 días', false),
  (v_user1_id, NULL, 'budget_alert', 'El consumo de energía ha alcanzado el 85% del presupuesto mensual', false);
END $$;

-- ============================================
-- RESUMEN
-- ============================================

SELECT 
  '✅ Datos de prueba insertados correctamente' as status;

SELECT 
  'Usuarios creados:' as info,
  COUNT(*) as cantidad
FROM profiles;

SELECT 
  'Facturas creadas:' as info,
  COUNT(*) as cantidad
FROM utility_bills;

SELECT 
  'Umbrales de presupuesto:' as info,
  COUNT(*) as cantidad
FROM budget_thresholds;

-- Mostrar usuarios y contraseñas
SELECT 
  '📋 USUARIOS DE PRUEBA' as info;

SELECT 
  email,
  role,
  'Contraseña: admin123 o user123' as password,
  location
FROM profiles
ORDER BY role DESC, email;

SELECT 
  '💡 TIP: Usa estos usuarios para iniciar sesión en la aplicación' as tip;

