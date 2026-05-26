package com.anhtin.tmdt.backend.modules.common.repository;

import com.anhtin.tmdt.backend.modules.common.entity.SystemConfigAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigAuditRepository extends JpaRepository<SystemConfigAudit, Long> {
    // Additional query methods can be added if needed
}
