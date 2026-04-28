package com.anhtin.tmdt.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderType;
    private String senderName;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
}
