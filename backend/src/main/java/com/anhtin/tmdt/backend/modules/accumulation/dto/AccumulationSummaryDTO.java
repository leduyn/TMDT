package com.anhtin.tmdt.backend.modules.accumulation.dto;

/**
 * DTO báo cáo tiến độ tích lũy của 1 đại lý trong 1 chương trình.
 */
public class AccumulationSummaryDTO {
    private Long agencyId;
    private String agencyName;
    private Long programId;
    private String programName;

    // Giá trị tích lũy
    private Double totalAccumulatedValue;    // Tổng giá trị đơn hàng tích lũy (value)
    private Double totalCollectedValue;      // Tổng tiền đã thu (paidValue)
    private Double totalRemainingDebt;       // Tổng nợ còn lại

    // Hạn mức đạt được
    private Double currentTierRate;          // Tỷ lệ hoa hồng hiện tại
    private String currentTierLabel;         // Mô tả mốc hiện tại
    private Double nextTierThreshold;        // Mốc tiếp theo
    private Double nextTierDistance;          // Khoảng cách đến mốc tiếp

    // Ước tính hoa hồng
    private Double estimatedCommission;      // Tổng HH ước tính = totalAccumulatedValue * currentTierRate
    private Double estimatedStage1;          // Đợt 1 = totalCollectedValue * currentTierRate
    private Double estimatedStage2;          // Đợt 2 = estimatedCommission - estimatedStage1

    // Thực tế đã trả
    private Double paidStage1;               // Số tiền đã trả đợt 1 (null nếu chưa)
    private String stage1Status;             // PENDING, APPROVED, PAID
    private Double paidStage2;
    private String stage2Status;

    // --- Getters & Setters ---
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }
    public Double getTotalAccumulatedValue() { return totalAccumulatedValue; }
    public void setTotalAccumulatedValue(Double totalAccumulatedValue) { this.totalAccumulatedValue = totalAccumulatedValue; }
    public Double getTotalCollectedValue() { return totalCollectedValue; }
    public void setTotalCollectedValue(Double totalCollectedValue) { this.totalCollectedValue = totalCollectedValue; }
    public Double getTotalRemainingDebt() { return totalRemainingDebt; }
    public void setTotalRemainingDebt(Double totalRemainingDebt) { this.totalRemainingDebt = totalRemainingDebt; }
    public Double getCurrentTierRate() { return currentTierRate; }
    public void setCurrentTierRate(Double currentTierRate) { this.currentTierRate = currentTierRate; }
    public String getCurrentTierLabel() { return currentTierLabel; }
    public void setCurrentTierLabel(String currentTierLabel) { this.currentTierLabel = currentTierLabel; }
    public Double getNextTierThreshold() { return nextTierThreshold; }
    public void setNextTierThreshold(Double nextTierThreshold) { this.nextTierThreshold = nextTierThreshold; }
    public Double getNextTierDistance() { return nextTierDistance; }
    public void setNextTierDistance(Double nextTierDistance) { this.nextTierDistance = nextTierDistance; }
    public Double getEstimatedCommission() { return estimatedCommission; }
    public void setEstimatedCommission(Double estimatedCommission) { this.estimatedCommission = estimatedCommission; }
    public Double getEstimatedStage1() { return estimatedStage1; }
    public void setEstimatedStage1(Double estimatedStage1) { this.estimatedStage1 = estimatedStage1; }
    public Double getEstimatedStage2() { return estimatedStage2; }
    public void setEstimatedStage2(Double estimatedStage2) { this.estimatedStage2 = estimatedStage2; }
    public Double getPaidStage1() { return paidStage1; }
    public void setPaidStage1(Double paidStage1) { this.paidStage1 = paidStage1; }
    public String getStage1Status() { return stage1Status; }
    public void setStage1Status(String stage1Status) { this.stage1Status = stage1Status; }
    public Double getPaidStage2() { return paidStage2; }
    public void setPaidStage2(Double paidStage2) { this.paidStage2 = paidStage2; }
    public String getStage2Status() { return stage2Status; }
    public void setStage2Status(String stage2Status) { this.stage2Status = stage2Status; }
}
