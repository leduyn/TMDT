package com.anhtin.tmdt.backend.modules.chat.service;

import com.anhtin.tmdt.backend.modules.common.dto.ChatMessageDTO;
import com.anhtin.tmdt.backend.modules.common.dto.ChatRoomDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.chat.repository.ChatRoomRepository;
import com.anhtin.tmdt.backend.modules.chat.repository.ChatMessageRepository;
import com.anhtin.tmdt.backend.modules.common.entity.SenderType;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.chat.entity.ChatMessage;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.chat.entity.ChatRoom;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

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
     * Khá»Ÿi táº¡o hoáº·c láº¥y phÃ²ng chat giá»¯a KhÃ¡ch vÃ  Äáº¡i lÃ½.
     */
    @Transactional
    public ChatRoomDTO getOrCreateRoom(@NonNull Long customerId, @NonNull Long agencyId) {
        ChatRoom room = chatRoomRepository.findByAgencyIdAndCustomerId(agencyId, customerId)
                .orElseGet(() -> {
                    Agency agency = agencyRepository.findById(agencyId)
                            .orElseThrow(() -> new RuntimeException("Äáº¡i lÃ½ khÃ´ng tá»“n táº¡i"));
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("KhÃ¡ch hÃ ng khÃ´ng tá»“n táº¡i"));

                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setAgency(agency);
                    newRoom.setCustomer(customer);
                    return chatRoomRepository.save(newRoom);
                });

        return toChatRoomDTO(room, customerId);
    }

    /**
     * Láº¥y danh sÃ¡ch phÃ²ng chat cá»§a user (Customer hoáº·c Agency).
     */
    public List<ChatRoomDTO> getUserRooms(@NonNull Long userId, Role userRole) {
        List<ChatRoom> rooms;
        if (userRole == Role.CUSTOMER) {
            rooms = chatRoomRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
        } else {
            // Agency: tÃ¬m theo agency_id (cáº§n láº¥y agencyId tá»« userId)
            Agency agency = agencyRepository.findAll().stream()
                    .filter(a -> a.getUser().getId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y Äáº¡i lÃ½"));
            rooms = chatRoomRepository.findByAgencyIdOrderByCreatedAtDesc(agency.getId());
        }

        return rooms.stream()
                .map(r -> toChatRoomDTO(r, userId))
                .collect(Collectors.toList());
    }

    /**
     * Gá»­i tin nháº¯n vÃ  tráº£ vá» DTO.
     */
    @Transactional
    public ChatMessageDTO sendMessage(@NonNull Long senderId, @NonNull Long roomId, String content, SenderType senderType) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("PhÃ²ng chat khÃ´ng tá»“n táº¡i"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i"));

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
     * Láº¥y lá»‹ch sá»­ tin nháº¯n (phÃ¢n trang).
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
     * ÄÃ¡nh dáº¥u Ä‘Ã£ Ä‘á»c.
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
