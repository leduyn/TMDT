package com.anhtin.tmdt.backend.modules.user.config;

import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@vinago.vn");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.COMPANY);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Admin account created: admin / Admin@123");
        } else {
            User admin = userRepository.findByUsername("admin").get();
            if (admin.getRole() != Role.COMPANY) {
                admin.setRole(Role.COMPANY);
                admin.setActive(true);
                userRepository.save(admin);
                log.info("Admin account updated to COMPANY role");
            }
        }
    }
}
