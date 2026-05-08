package com.anhtin.tmdt.backend.credit.repository;

import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentCreditRepository extends JpaRepository<AgentCredit, Long> {
    Optional<AgentCredit> findByAgencyId(Long agencyId);

    @Modifying
    @Query("UPDATE AgentCredit ac SET ac.totalDebt = ac.totalDebt + :amount " +
           "WHERE ac.agency.id = :agencyId AND (ac.creditLimit - ac.totalDebt + ac.vtcAvailable) >= :amount")
    int consumeCredit(@Param("agencyId") Long agencyId, @Param("amount") Double amount);

    @Modifying
    @Query("UPDATE AgentCredit ac SET ac.totalDebt = ac.totalDebt - :amount WHERE ac.agency.id = :agencyId")
    int decreaseDebt(@Param("agencyId") Long agencyId, @Param("amount") Double amount);
}
