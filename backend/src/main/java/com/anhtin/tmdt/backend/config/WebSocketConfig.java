package com.anhtin.tmdt.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket sử dụng STOMP protocol.
 * - /ws: endpoint kết nối WebSocket (hỗ trợ SockJS fallback).
 * - /topic: prefix cho broadcast messages (1-to-many).
 * - /queue: prefix cho private messages (1-to-1).
 * - /app: prefix cho messages gửi từ client lên server.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Enable simple broker cho topic (broadcast) và queue (private)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix cho messages gửi từ client tới @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // Prefix cho tin nhắn riêng tư tới user cụ thể
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Endpoint kết nối WebSocket, hỗ trợ SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
