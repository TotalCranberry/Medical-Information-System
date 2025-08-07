package com.mis.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID; 

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.mis.dto.ProfileUpdateRequest;
import com.mis.model.AuthMethod;
import com.mis.model.Role;
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

    /**
     * Registers a new user with the provided details.
     * @param user The user entity to be registered.
     * @param rawPassword The raw password to be encoded and stored.
     * @return The saved User entity.
     * @throws IllegalArgumentException if the email already exists.
     */
    public User register(User user, String rawPassword) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }
        
        // Generate and assign a unique ID for the new user
        user.setId(UUID.randomUUID().toString());
        
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLastLogin(LocalDateTime.now());

        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
    
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }


    // --- New Method for Google Auth ---
    /**
     * Processes a user logging in via Google.
     * If the user exists, returns them. If not, creates a new user.
     * @param payload The payload from the verified Google ID token.
     * @return The existing or newly created User.
     */
    public User processGoogleUser(Payload payload) {
        String email = payload.getEmail();
        
        // Find if user already exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            userOpt.get().setLastLogin(LocalDateTime.now());
            userRepository.save(userOpt.get());
            return userOpt.get();
        }

        // Create a new user if they don't exist
        User newUser = new User();

        // Generate and assign a unique ID for the new Google user
        newUser.setId(UUID.randomUUID().toString());
        
        newUser.setEmail(email);
        newUser.setName((String) payload.get("name"));
        newUser.setAuthMethod(AuthMethod.GoogleAuth);
        newUser.setRole(Role.Student);
        newUser.setLastLogin(LocalDateTime.now());
        
        // Google users don't have a password in our system
        newUser.setPasswordHash(null); 

        return userRepository.save(newUser);
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security Check 1: Prevent password change for Google users
        if (user.getAuthMethod() == AuthMethod.GoogleAuth) {
            throw new IllegalStateException("Cannot change password for an account registered with Google.");
        }

        // Security Check 2: Verify the current password is correct
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalStateException("Incorrect current password.");
        }

        // Encode and set the new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateUserProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        return userRepository.save(user);
    }
}
