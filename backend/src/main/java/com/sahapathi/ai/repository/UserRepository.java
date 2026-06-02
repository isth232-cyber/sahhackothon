package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Role;
import com.sahapathi.ai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findByRoleAndIsActiveTrue(Role role);
    long countByRole(Role role);
}
