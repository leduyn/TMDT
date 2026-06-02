package com.anhtin.tmdt.backend.modules.salespolicy.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.anhtin.tmdt.backend.modules.salespolicy.repository.SalesPolicyRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyTier;
import java.util.List;

@SpringBootTest
public class DbDumpTest {

    @Autowired
    private SalesPolicyRepository salesPolicyRepository;

    @Test
    public void dumpDb() {
        System.out.println("=== DUMPING SALES POLICIES ===");
        List<SalesPolicy> policies = salesPolicyRepository.findAll();
        for (SalesPolicy p : policies) {
            System.out.println("ID: " + p.getId());
            System.out.println("Name: " + p.getName());
            System.out.println("Active: " + p.isActive());
            System.out.println("PolicyType: " + p.getPolicyType());
            System.out.println("TargetType: " + p.getTargetType());
            System.out.println("ConditionType: " + p.getConditionType());
            System.out.println("StartDate: " + p.getStartDate());
            System.out.println("EndDate: " + p.getEndDate());
            System.out.println("ApplyToAllProducts: " + p.isApplyToAllProducts());
            System.out.println("ExcludedProducts: " + p.getExcludedProducts().size());
            System.out.println("Tiers size: " + p.getTiers().size());
            for (SalesPolicyTier t : p.getTiers()) {
                System.out.println("  Tier index: " + t.getTierIndex() + ", threshold: " + t.getThresholdValue() + ", operator: " + t.getOperator() + ", adjType: " + t.getAdjustmentType() + ", adjVal: " + t.getAdjustmentValue());
            }
            System.out.println("--------------------");
        }
        System.out.println("=== END OF DUMP ===");
    }
}
