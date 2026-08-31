-- Seed Data Provinsi
INSERT INTO provinces (id, name, is_java_island) VALUES
('31', 'DKI JAKARTA', true),
('32', 'JAWA BARAT', true),
('33', 'JAWA TENGAH', true),
('35', 'JAWA TIMUR', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Data Regency (Kota / Kabupaten Sample)
INSERT INTO regencies (id, province_id, name) VALUES
('3175', '31', 'KOTA JAKARTA TIMUR'),
('3275', '32', 'KOTA BEKASI')
ON CONFLICT (id) DO NOTHING;

-- Seed Data District (Kecamatan Sample)
INSERT INTO districts (id, regency_id, name) VALUES
('317506', '3175', 'KRAMAT JATI'),
('327504', '3275', 'RAWALUMBU')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Village (Kelurahan Sample)
INSERT INTO villages (id, district_id, name) VALUES
('3175061001', '317506', 'KRAMAT JATI'),
('3275041002', '3275', 'SEPANJANG JAYA')
ON CONFLICT (id) DO NOTHING;