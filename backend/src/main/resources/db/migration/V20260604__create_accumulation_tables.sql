-- =====================================================
-- V20260604: Accumulation Rebate Program Tables
-- =====================================================

-- 1. Chương trình tích lũy
CREATE TABLE IF NOT EXISTS accumulation_programs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rebate_calculation_type VARCHAR(50) NOT NULL DEFAULT 'HIGHEST_THRESHOLD',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Các mốc hạn mức (tiers)
CREATE TABLE IF NOT EXISTS accumulation_program_tiers (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES accumulation_programs(id) ON DELETE CASCADE,
    tier_index INT NOT NULL DEFAULT 0,
    threshold_value DOUBLE PRECISION NOT NULL,
    rebate_rate DOUBLE PRECISION NOT NULL,
    UNIQUE(program_id, tier_index)
);

-- 3. Liên kết đại lý tham gia chương trình
CREATE TABLE IF NOT EXISTS accumulation_program_agencies (
    program_id BIGINT NOT NULL REFERENCES accumulation_programs(id) ON DELETE CASCADE,
    agency_id BIGINT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, agency_id)
);

-- 4. Lịch sử trả thưởng hoa hồng
CREATE TABLE IF NOT EXISTS accumulation_payments (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES accumulation_programs(id) ON DELETE CASCADE,
    agency_id BIGINT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    payment_stage INT NOT NULL,
    accumulated_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    collected_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    rebate_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    notes TEXT,
    UNIQUE(program_id, agency_id, payment_stage)
);
