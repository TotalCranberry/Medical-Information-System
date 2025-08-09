package com.mis.service;

import java.util.Optional;
import java.util.UUID; // Import the UUID class

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
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
        
        // FIX: Generate and assign a unique ID for the new user
        user.setId(UUID.randomUUID().toString());
        
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
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
            return userOpt.get();
        }

        // Create a new user if they don't exist
        User newUser = new User();

        // FIX: Generate and assign a unique ID for the new Google user
        newUser.setId(UUID.randomUUID().toString());
        
        newUser.setEmail(email);
        newUser.setName((String) payload.get("name"));
        newUser.setAuthMethod(AuthMethod.GoogleAuth);
        newUser.setRole(Role.Student);
        
        // Google users don't have a password in our system
        newUser.setPasswordHash(null); 

        return userRepository.save(newUser);
    }
}
