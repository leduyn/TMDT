package com.anhtin.tmdt.backend.modules.accumulation.repository;

import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccumulationPaymentRepository extends JpaRepository<AccumulationPayment, Long> {

    List<AccumulationPayment> findByAgencyId(Long agencyId);

    Optional<AccumulationPayment> findByAgencyIdAndPaymentStage(Long agencyId, Integer paymentStage);
}
