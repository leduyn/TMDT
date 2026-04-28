package com.anhtin.tmdt.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private Long agencyId;
    private String agencyName;
    private Long customerId;
    private String customerName;
    private long unreadCount;
    private LocalDateTime createdAt;
}
