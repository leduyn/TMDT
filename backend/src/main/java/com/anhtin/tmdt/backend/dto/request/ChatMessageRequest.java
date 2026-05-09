package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatMessageRequest {
    @NotNull
    private Long roomId;

    @NotBlank
    private String content;

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
