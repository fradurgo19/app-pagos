-- ==================================================
-- MIGRACIÓN: Agregar Campo "Número de Contrato"
-- Fecha: 2025-01-15
-- Proyecto: APPpagos
-- Base de Datos: Supabase Production
-- ==================================================

-- Agregar columna contract_number a la tabla utility_bills
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number TEXT;

-- Agregar comentario descriptivo a la columna
COMMENT ON COLUMN utility_bills.contract_number IS 'Número de contrato asociado a la factura';

-- Verificar que la columna fue creada correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'utility_bills' 
AND column_name = 'contract_number';

-- RESULTADO ESPERADO:
-- column_name     | data_type | is_nullable | column_default
-- ----------------+-----------+-------------+----------------
-- contract_number | text      | YES         | 

