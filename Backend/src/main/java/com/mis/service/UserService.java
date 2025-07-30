package com.mis.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mis.model.User;
import com.mis.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registration logic
    public User register(User user, String rawPassword) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }
        // Hash the password before saving
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    // Authentication logic
    public Optional<User> authenticate(String email, String rawPassword) {
    Optional<User> userOpt = userRepository.findByEmail(email);
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            // Authentication successful
            return Optional.of(user);
        }
    }
    return Optional.empty(); // auth failed
}

    public Optional<User> findById(String userId) {
        // TODO Auto-generated method stub
        if (userId == null || userId.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findById(userId);

    }

}
