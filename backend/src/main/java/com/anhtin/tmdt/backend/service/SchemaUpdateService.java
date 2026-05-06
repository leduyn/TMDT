package com.anhtin.tmdt.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SchemaUpdateService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void updateSchema() {
        try {
            System.out.println(">> Attempting to drop unique constraint on agency_price_lists...");
            // Drop the constraint if it exists. The name is from the error log.
            jdbcTemplate.execute("ALTER TABLE agency_price_lists DROP CONSTRAINT IF EXISTS uka1q79lcwbqafi8hqdpohpvau5");
            System.out.println(">> Successfully dropped constraint uka1q79lcwbqafi8hqdpohpvau5");
        } catch (Exception e) {
            System.err.println(">> Could not drop constraint: " + e.getMessage());
        }
    }
}
