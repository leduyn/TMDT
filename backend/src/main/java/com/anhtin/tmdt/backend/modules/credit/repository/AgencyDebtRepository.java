package com.anhtin.tmdt.backend.modules.credit.repository;

import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgencyDebtRepository extends JpaRepository<AgencyDebt, Long> {
    List<AgencyDebt> findByAgencyIdOrderByRecordingDateDesc(Long agencyId);
    List<AgencyDebt> findByOrderId(Long orderId);
    List<AgencyDebt> findAllByOrderByRecordingDateDesc();

    @Query("SELECT d FROM AgencyDebt d WHERE d.agency.id = :agencyId AND d.recordingDate BETWEEN :startDate AND :endDate AND d.debtCode NOT LIKE 'PAY-%' ORDER BY d.recordingDate ASC")
    List<AgencyDebt> findByAgencyIdAndRecordingDateBetween(@Param("agencyId") Long agencyId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT d FROM AgencyDebt d WHERE d.recordingDate BETWEEN :startDate AND :endDate AND d.debtCode NOT LIKE 'PAY-%' ORDER BY d.recordingDate ASC")
    List<AgencyDebt> findByRecordingDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT d FROM AgencyDebt d WHERE d.agency.id IN :agencyIds AND d.recordingDate BETWEEN :startDate AND :endDate AND d.debtCode NOT LIKE 'PAY-%' ORDER BY d.agency.id, d.recordingDate ASC")
    List<AgencyDebt> findByAgencyIdsAndRecordingDateBetween(@Param("agencyIds") List<Long> agencyIds, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
