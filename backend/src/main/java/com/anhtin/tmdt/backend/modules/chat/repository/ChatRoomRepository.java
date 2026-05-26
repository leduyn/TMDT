package com.anhtin.tmdt.backend.modules.chat.repository;

import com.anhtin.tmdt.backend.modules.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByAgencyIdAndCustomerId(Long agencyId, Long customerId);
    List<ChatRoom> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ChatRoom> findByAgencyIdOrderByCreatedAtDesc(Long agencyId);
}
