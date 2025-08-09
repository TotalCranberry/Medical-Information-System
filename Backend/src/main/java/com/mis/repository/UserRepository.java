package com.mis.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
