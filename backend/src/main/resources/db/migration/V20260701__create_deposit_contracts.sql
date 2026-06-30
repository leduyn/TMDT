CREATE TABLE IF NOT EXISTS deposit_contracts (
    id BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    agency_id BIGINT NOT NULL,
    deposit_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    contract_date TIMESTAMP NOT NULL DEFAULT NOW(),
    terms TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    signed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
