package com.anhtin.tmdt.backend.modules.user.repository;

import com.anhtin.tmdt.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByTaxCode(String taxCode);
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.assignments a WHERE a.agency.id = :agencyId")
    java.util.List<User> findByAgenciesId(Long agencyId);
}
