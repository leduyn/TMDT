package com.anhtin.tmdt.backend.modules.credit.dto;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

/**
 * Request body for creating or updating an agency's credit terms.
 */
public class CreditTermsRequest {
    /** Hạn mức tín dụng (VND) */
    private Double creditLimit;
    /** Kỳ hạn nợ (số ngày) */
    private Integer debtTermDays;
    /** Số dư ký quỹ ban đầu khi khởi tạo (tuỳ chọn) */
    private Double initialVtc;

    public Double getCreditLimit() { return creditLimit; }
    public void setCreditLimit(Double creditLimit) { this.creditLimit = creditLimit; }

    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }

    public Double getInitialVtc() { return initialVtc; }
    public void setInitialVtc(Double initialVtc) { this.initialVtc = initialVtc; }
}
