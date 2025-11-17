package com.mis.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.AccountStatus;
import com.mis.model.Role;
import com.mis.model.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    List<User> findByStatus(AccountStatus status);
    boolean existsByRole(Role role);
}
