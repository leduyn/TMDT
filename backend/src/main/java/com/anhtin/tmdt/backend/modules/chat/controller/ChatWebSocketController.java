package com.anhtin.tmdt.backend.modules.chat.controller;

import com.anhtin.tmdt.backend.modules.chat.dto.ChatMessageRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ChatMessageDTO;
import com.anhtin.tmdt.backend.modules.common.entity.SenderType;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.modules.chat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

/**
 * WebSocket handler cho real-time chat.
 * Client gửi message tới /app/chat.send
 * Server broadcast tới /topic/chat.room.{roomId}
 */
@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request, Authentication authentication) {
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();

        // Xác định loại sender
        String authority = user.getAuthorities().iterator().next().getAuthority();
        SenderType senderType = "ROLE_CUSTOMER".equals(authority)
                ? SenderType.CUSTOMER : SenderType.AGENCY;

        Long userId = user.getId();
        Long roomId = request.getRoomId();
        if (userId == null || roomId == null) return;

        // Lưu tin nhắn vào DB
        ChatMessageDTO message = chatService.sendMessage(
                userId, roomId, request.getContent(), senderType);

        // Broadcast tới tất cả subscribers của phòng chat
        if (message != null) {
            messagingTemplate.convertAndSend(
                    "/topic/chat.room." + roomId, message);
        }
    }
}
