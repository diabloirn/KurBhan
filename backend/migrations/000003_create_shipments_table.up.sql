CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    origin_village_id VARCHAR(10) REFERENCES villages(id),
    destination_village_id VARCHAR(10) REFERENCES villages(id),
    origin_address_detail TEXT NOT NULL,
    destination_address_detail TEXT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    transit_type VARCHAR(50) NOT NULL,
    actual_weight_kg DOUBLE PRECISION NOT NULL,
    length_cm DOUBLE PRECISION NOT NULL,
    width_cm DOUBLE PRECISION NOT NULL,
    height_cm DOUBLE PRECISION NOT NULL,
    total_price DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracking_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);