package com.anhtin.tmdt.backend.credit.dto;

import lombok.Data;

/**
 * Request body for creating or updating an agency's credit terms.
 */
@Data
public class CreditTermsRequest {
    /** Hạn mức tín dụng (VND) */
    private Double  creditLimit;
    /** Kỳ hạn nợ (số ngày) */
    private Integer debtTermDays;
    /** Số dư ký quỹ ban đầu khi khởi tạo (tuỳ chọn) */
    private Double  initialVtc;
}
