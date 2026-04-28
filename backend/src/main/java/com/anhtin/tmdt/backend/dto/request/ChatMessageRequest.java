package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {
    @NotNull
    private Long roomId;

    @NotBlank
    private String content;
}
