package com.anhtin.tmdt.backend.modules.credit.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseFixConfig {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixDatabaseSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE agency_debts ALTER COLUMN order_id DROP NOT NULL");
            System.out.println("Successfully dropped NOT NULL constraint on agency_debts.order_id");
            
            jdbcTemplate.execute("ALTER TABLE agency_debts DROP CONSTRAINT IF EXISTS agency_debts_debt_type_check");
            System.out.println("Successfully dropped debt_type check constraint");
        } catch (Exception e) {
            System.out.println("Note: Could not fix schema. " + e.getMessage());
        }
    }
}
