package com.anhtin.tmdt.backend.modules.accumulation.repository;

import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccumulationProgramRepository extends JpaRepository<AccumulationProgram, Long> {

    List<AccumulationProgram> findAllByOrderByCreatedAtDesc();

    List<AccumulationProgram> findByActiveTrue();

    // Chương trình đã kết thúc nhưng chưa chốt đợt 1
    @Query("SELECT p FROM AccumulationProgram p WHERE p.endDate <= :now AND p.status = 'ACTIVE' AND p.active = true")
    List<AccumulationProgram> findEndedProgramsPendingStage1(@Param("now") LocalDateTime now);

    // Tìm chương trình mà đại lý tham gia
    @Query("SELECT p FROM AccumulationProgram p JOIN p.agencies a WHERE a.id = :agencyId AND p.active = true")
    List<AccumulationProgram> findByAgencyId(@Param("agencyId") Long agencyId);
}
