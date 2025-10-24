-- Migration: Add contract_number column to utility_bills table
-- Date: 2025-01-15

-- Add contract_number column to utility_bills table
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number TEXT;

-- Add comment to the column
COMMENT ON COLUMN utility_bills.contract_number IS 'Número de contrato asociado a la factura';

