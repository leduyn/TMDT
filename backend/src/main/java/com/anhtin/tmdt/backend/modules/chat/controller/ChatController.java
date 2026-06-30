package com.anhtin.tmdt.backend.modules.chat.controller;

import com.anhtin.tmdt.backend.modules.chat.dto.ChatMessageRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ChatMessageDTO;
import com.anhtin.tmdt.backend.modules.common.dto.ChatRoomDTO;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.common.entity.SenderType;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
import com.anhtin.tmdt.backend.modules.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    private Long resolveUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        } else if (principal instanceof AgencyUserDetails) {
            return ((AgencyUserDetails) principal).getId();
        }
        return null;
    }

    private Role getUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> {
                    String role = a.getAuthority();
                    if ("ROLE_CUSTOMER".equals(role)) return Role.CUSTOMER;
                    return Role.AGENCY;
                })
                .orElse(Role.CUSTOMER);
    }

    /**
     * Khởi tạo hoặc lấy phòng chat giữa Khách hàng và Đại lý.
     */
    @PostMapping("/rooms")
    public ResponseEntity<?> getOrCreateRoom(
            @RequestParam @NonNull Long agencyId,
            Authentication authentication) {
        try {
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            ChatRoomDTO room = chatService.getOrCreateRoom(userId, agencyId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy danh sách phòng chat của user hiện tại.
     */
    @GetMapping("/rooms")
    public ResponseEntity<?> getMyRooms(Authentication authentication) {
        try {
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            Role role = getUserRole(authentication);
            List<ChatRoomDTO> rooms = chatService.getUserRooms(userId, role);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Gửi tin nhắn qua REST (backup cho WebSocket).
     */
    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        try {
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            SenderType senderType = getUserRole(authentication) == Role.CUSTOMER
                    ? SenderType.CUSTOMER : SenderType.AGENCY;

            Long roomId = request.getRoomId();
            if (roomId == null) throw new RuntimeException("Room ID is required");

            ChatMessageDTO msg = chatService.sendMessage(
                    userId, roomId, request.getContent(), senderType);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy lịch sử tin nhắn (phân trang, mới nhất trước).
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable @NonNull Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Page<ChatMessageDTO> messages = chatService.getMessages(roomId, PageRequest.of(page, size));
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Đánh dấu đã đọc tất cả tin nhắn trong phòng.
     */
    @PutMapping("/rooms/{roomId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable @NonNull Long roomId,
            Authentication authentication) {
        try {
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            chatService.markAsRead(roomId, userId);
            return ResponseEntity.ok(new MessageResponse("Đã đánh dấu đã đọc"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
