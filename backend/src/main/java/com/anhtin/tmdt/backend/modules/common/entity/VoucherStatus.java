package com.anhtin.tmdt.backend.modules.common.entity;

public enum VoucherStatus {
    PENDING,    // Đang chờ thực hiện
    APPLIED,    // Đã áp dụng
    CANCELLED,  // Đã huỷ
    STOPPED     // Đã dừng hoạt động (sau khi áp dụng)
}
