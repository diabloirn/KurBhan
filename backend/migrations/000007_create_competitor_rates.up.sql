CREATE TABLE IF NOT EXISTS competitor_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor VARCHAR(30) NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    service_type VARCHAR(50),
    price DOUBLE PRECISION NOT NULL,
    etd_days VARCHAR(20),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_competitor_rates_route ON competitor_rates(origin_city, destination_city);
CREATE INDEX idx_competitor_rates_competitor ON competitor_rates(competitor);
CREATE INDEX idx_competitor_rates_scraped ON competitor_rates(scraped_at);
