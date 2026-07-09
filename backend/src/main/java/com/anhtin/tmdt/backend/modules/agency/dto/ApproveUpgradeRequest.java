package com.anhtin.tmdt.backend.modules.agency.dto;

public class ApproveUpgradeRequest {
    private boolean approved;
    private String rejectReason;

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
}