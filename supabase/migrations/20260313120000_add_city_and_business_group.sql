-- Ciudad y grupo empresarial en facturas (indexados para consultas y filtros)

ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS business_group text;

COMMENT ON COLUMN utility_bills.city IS 'Ciudad de la sede (ej. BOGOTA, MEDELLIN)';
COMMENT ON COLUMN utility_bills.business_group IS 'Grupo empresarial (ej. PARTEQUIPOS S.A.S.)';

CREATE INDEX IF NOT EXISTS idx_bills_city ON utility_bills(city);
CREATE INDEX IF NOT EXISTS idx_bills_business_group ON utility_bills(business_group);
CREATE INDEX IF NOT EXISTS idx_bills_city_location_group ON utility_bills(city, location, business_group);
