package com.anhtin.tmdt.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.entity.Role;

@Component
public class TestRunner implements CommandLineRunner {
    private final UserRepository repo;

    public TestRunner(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        System.out.println("USERS IN DB:");
        repo.findAll().forEach(u -> System.out.println("User: " + u.getUsername() + ", Role: " + u.getRole()));
    }
}
