CREATE TABLE deposit_payments (
    id BIGSERIAL PRIMARY KEY,
    deposit_contract_id BIGINT NOT NULL REFERENCES deposit_contracts(id),
    amount DOUBLE PRECISION NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE deposit_contracts ADD COLUMN IF NOT EXISTS paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0;
