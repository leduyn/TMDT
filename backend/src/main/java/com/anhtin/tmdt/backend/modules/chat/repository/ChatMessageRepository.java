package com.anhtin.tmdt.backend.modules.chat.repository;

import com.anhtin.tmdt.backend.modules.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.room.id = :roomId AND m.sender.id != :userId AND m.isRead = false")
    void markMessagesAsRead(Long roomId, Long userId);

    long countByRoomIdAndIsReadFalseAndSenderIdNot(Long roomId, Long senderId);
}
