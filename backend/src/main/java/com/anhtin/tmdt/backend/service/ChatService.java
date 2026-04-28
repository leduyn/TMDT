package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.response.ChatMessageDTO;
import com.anhtin.tmdt.backend.dto.response.ChatRoomDTO;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Khởi tạo hoặc lấy phòng chat giữa Khách và Đại lý.
     */
    @Transactional
    public ChatRoomDTO getOrCreateRoom(@NonNull Long customerId, @NonNull Long agencyId) {
        ChatRoom room = chatRoomRepository.findByAgencyIdAndCustomerId(agencyId, customerId)
                .orElseGet(() -> {
                    Agency agency = agencyRepository.findById(agencyId)
                            .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setAgency(agency);
                    newRoom.setCustomer(customer);
                    return chatRoomRepository.save(newRoom);
                });

        return toChatRoomDTO(room, customerId);
    }

    /**
     * Lấy danh sách phòng chat của user (Customer hoặc Agency).
     */
    public List<ChatRoomDTO> getUserRooms(@NonNull Long userId, Role userRole) {
        List<ChatRoom> rooms;
        if (userRole == Role.CUSTOMER) {
            rooms = chatRoomRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
        } else {
            // Agency: tìm theo agency_id (cần lấy agencyId từ userId)
            Agency agency = agencyRepository.findAll().stream()
                    .filter(a -> a.getUser().getId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Đại lý"));
            rooms = chatRoomRepository.findByAgencyIdOrderByCreatedAtDesc(agency.getId());
        }

        return rooms.stream()
                .map(r -> toChatRoomDTO(r, userId))
                .collect(Collectors.toList());
    }

    /**
     * Gửi tin nhắn và trả về DTO.
     */
    @Transactional
    public ChatMessageDTO sendMessage(@NonNull Long senderId, @NonNull Long roomId, String content, SenderType senderType) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSender(sender);
        message.setSenderType(senderType);
        message.setContent(content);

        message = chatMessageRepository.save(message);

        return new ChatMessageDTO(
                message.getId(), roomId, senderId,
                senderType.name(), sender.getUsername(),
                content, false, message.getCreatedAt()
        );
    }

    /**
     * Lấy lịch sử tin nhắn (phân trang).
     */
    public Page<ChatMessageDTO> getMessages(@NonNull Long roomId, Pageable pageable) {
        return chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, pageable)
                .map(m -> new ChatMessageDTO(
                        m.getId(), roomId, m.getSender().getId(),
                        m.getSenderType().name(), m.getSender().getUsername(),
                        m.getContent(), m.isRead(), m.getCreatedAt()
                ));
    }

    /**
     * Đánh dấu đã đọc.
     */
    @Transactional
    public void markAsRead(@NonNull Long roomId, @NonNull Long userId) {
        chatMessageRepository.markMessagesAsRead(roomId, userId);
    }

    private ChatRoomDTO toChatRoomDTO(ChatRoom room, Long currentUserId) {
        long unread = chatMessageRepository.countByRoomIdAndIsReadFalseAndSenderIdNot(room.getId(), currentUserId);
        return new ChatRoomDTO(
                room.getId(),
                room.getAgency().getId(),
                room.getAgency().getName(),
                room.getCustomer().getId(),
                room.getCustomer().getUsername(),
                unread,
                room.getCreatedAt()
        );
    }
}
