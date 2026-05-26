package com.anhtin.tmdt.backend.modules.price.entity;

public enum PriceListConditionType {
    AGENCY_RANK,    // Áp dụng cho đại lý theo hạng (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND)
    ALL_AGENCY,     // Áp dụng cho toàn bộ đại lý
    CUSTOMER_GROUP, // Áp dụng cho nhóm khách hàng cụ thể
    ALL_CUSTOMER,   // Áp dụng cho toàn bộ khách hàng
    DIRECT_AGENCY,   // Áp dụng trực tiếp cho 1 đại lý cụ thể
    DIRECT_CUSTOMER // Áp dụng trực tiếp cho 1 khách hàng cụ thể
}
