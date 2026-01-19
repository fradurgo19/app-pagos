-- Migration: soporte de consumos múltiples por factura
-- Crea tabla bill_consumptions y ajustes mínimos para compatibilidad

-- Crear tabla de consumos vinculados a facturas
CREATE TABLE IF NOT EXISTS bill_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES utility_bills(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer', 'cellular', 'security', 'administration', 'rent', 'other')),
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_bill_consumptions_bill_id ON bill_consumptions(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_consumptions_service_type ON bill_consumptions(service_type);
CREATE INDEX IF NOT EXISTS idx_bill_consumptions_period ON bill_consumptions(period_from, period_to);

-- Trigger de updated_at
CREATE TRIGGER update_bill_consumptions_updated_at
  BEFORE UPDATE ON bill_consumptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Relajar NOT NULL de service_type para compatibilidad con vista anterior (se mantendrá poblado con el primer consumo)
ALTER TABLE utility_bills ALTER COLUMN service_type DROP NOT NULL;
