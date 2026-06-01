package com.anhtin.tmdt.backend.modules.accumulation.entity;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "accumulation_programs")
public class AccumulationProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "rebate_calculation_type", nullable = false, length = 50)
    private RebateCalculationType rebateCalculationType = RebateCalculationType.HIGHEST_THRESHOLD;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProgramStatus status = ProgramStatus.DRAFT;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "unlimited")
    private Boolean unlimited = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Các mốc hạn mức
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("tierIndex ASC")
    private List<AccumulationProgramTier> tiers = new ArrayList<>();

    // Đại lý tham gia
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "accumulation_program_agencies",
        joinColumns = @JoinColumn(name = "program_id"),
        inverseJoinColumns = @JoinColumn(name = "agency_id")
    )
    private Set<Agency> agencies = new HashSet<>();

    public AccumulationProgram() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public RebateCalculationType getRebateCalculationType() { return rebateCalculationType; }
    public void setRebateCalculationType(RebateCalculationType rebateCalculationType) { this.rebateCalculationType = rebateCalculationType; }

    public ProgramStatus getStatus() { return status; }
    public void setStatus(ProgramStatus status) { this.status = status; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isUnlimited() { return unlimited != null && unlimited; }
    public void setUnlimited(Boolean unlimited) { this.unlimited = unlimited; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<AccumulationProgramTier> getTiers() { return tiers; }
    public void setTiers(List<AccumulationProgramTier> tiers) { this.tiers = tiers; }

    public Set<Agency> getAgencies() { return agencies; }
    public void setAgencies(Set<Agency> agencies) { this.agencies = agencies; }

    // ===== Enums =====
    public enum RebateCalculationType {
        HIGHEST_THRESHOLD,      // Tính hoa hồng theo mốc cao nhất đạt được
        TIERED_PROGRESSIVE      // Tính lũy tiến bậc thang từng khoảng
    }

    public enum ProgramStatus {
        DRAFT,                  // Nháp
        ACTIVE,                 // Đang chạy
        ENDED,                  // Đã kết thúc, chờ chốt
        STAGE1_PENDING,         // Đã tính đợt 1, chờ Admin duyệt
        STAGE1_APPROVED,        // Đợt 1 đã duyệt
        COMPLETED               // Hoàn tất (đợt 2 đã xử lý)
    }
}
