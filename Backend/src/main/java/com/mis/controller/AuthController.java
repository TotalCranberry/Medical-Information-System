package com.mis.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mis.dto.LoginRequest;
import com.mis.dto.LoginResponse;
import com.mis.dto.RegisterRequest;
import com.mis.dto.UserResponse;
import com.mis.mapper.UserMapper;
import com.mis.model.User;
import com.mis.security.JwtTokenProvider;
import com.mis.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User userEntity = UserMapper.toUser(request);
            User savedUser = userService.register(userEntity, request.getPassword());
            UserResponse response = UserMapper.toUserResponse(savedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOpt = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            if (userOpt.isPresent()) {
                String token = jwtTokenProvider.createToken(userOpt.get());
                String role = userOpt.get().getRole().name();
                LoginResponse response = new LoginResponse(token, "Login successful", role);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
            }
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
    }

    // FIX: Added the /profile endpoint to get the current authenticated user's data.
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        // The JWT filter sets the authentication object. We can get the user ID from it.
        String userId = authentication.getName(); 
        Optional<User> userOpt = userService.findById(userId); // You will need to add findById to your UserService

        if (userOpt.isPresent()) {
            UserResponse response = UserMapper.toUserResponse(userOpt.get());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }
}
