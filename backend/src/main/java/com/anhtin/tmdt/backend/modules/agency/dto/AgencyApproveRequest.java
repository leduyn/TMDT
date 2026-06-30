package com.anhtin.tmdt.backend.modules.agency.dto;

public class AgencyApproveRequest {
    private String type;
    private Double depositAmount;
    private Integer debtTermDays;
    private Double initialVtc;
    private String contractTerms;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getDepositAmount() { return depositAmount; }
    public void setDepositAmount(Double depositAmount) { this.depositAmount = depositAmount; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
    public Double getInitialVtc() { return initialVtc; }
    public void setInitialVtc(Double initialVtc) { this.initialVtc = initialVtc; }
    public String getContractTerms() { return contractTerms; }
    public void setContractTerms(String contractTerms) { this.contractTerms = contractTerms; }
}
