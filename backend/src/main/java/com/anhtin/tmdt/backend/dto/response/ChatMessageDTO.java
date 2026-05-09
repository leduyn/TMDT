package com.anhtin.tmdt.backend.dto.response;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderType;
    private String senderName;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Long id, Long roomId, Long senderId, String senderType, String senderName, String content, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderType = senderType;
        this.senderName = senderName;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
