DROP INDEX IF EXISTS idx_shipments_driver;
ALTER TABLE shipments DROP COLUMN IF EXISTS cod_remaining_collected;
ALTER TABLE shipments DROP COLUMN IF EXISTS cod_dp_collected;
ALTER TABLE shipments DROP COLUMN IF EXISTS driver_location_updated_at;
ALTER TABLE shipments DROP COLUMN IF EXISTS driver_longitude;
ALTER TABLE shipments DROP COLUMN IF EXISTS driver_latitude;
ALTER TABLE shipments DROP COLUMN IF EXISTS delivery_proof_url;
ALTER TABLE shipments DROP COLUMN IF EXISTS driver_accepted_at;
ALTER TABLE shipments DROP COLUMN IF EXISTS assigned_driver_id;
