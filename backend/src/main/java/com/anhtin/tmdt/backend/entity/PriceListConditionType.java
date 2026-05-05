package com.anhtin.tmdt.backend.entity;

public enum PriceListConditionType {
    AGENCY_RANK,    // Áp dụng cho đại lý theo hạng (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND)
    ALL_AGENCY,     // Áp dụng cho toàn bộ đại lý
    CUSTOMER_GROUP, // Áp dụng cho nhóm khách hàng cụ thể
    ALL_CUSTOMER    // Áp dụng cho toàn bộ khách hàng
}
