package com.mis.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.mis.dto.LoginRequest;
import com.mis.dto.LoginResponse;
import com.mis.dto.RegisterRequest;
import com.mis.dto.UserResponse;
import com.mis.mapper.UserMapper;
import com.mis.model.AccountStatus;
import com.mis.model.User;
import com.mis.security.JwtTokenProvider;
import com.mis.service.GoogleTokenVerifierService;
import com.mis.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider, GoogleTokenVerifierService googleTokenVerifierService) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User userEntity = UserMapper.toUser(request);
            User savedUser = userService.register(userEntity, request.getPassword());
            UserResponse response = UserMapper.toUserResponse(savedUser, null, null);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOpt = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getStatus() == AccountStatus.PENDING_APPROVAL) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Your account is pending approval by an administrator."));
                }
                if (user.getStatus() == AccountStatus.DISABLED) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Your account has been disabled."));
                }
                String token = jwtTokenProvider.createToken(user);
                String role = user.getRole().name();
                LoginResponse response = new LoginResponse(token, "Login successful", role);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idToken = body.get("token");
        if (idToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID token is missing."));
        }
        try {
            Payload payload = googleTokenVerifierService.verify(idToken);
            User user = userService.processGoogleUser(payload);
            String appToken = jwtTokenProvider.createToken(user);
            String role = user.getRole().name();
            LoginResponse response = new LoginResponse(appToken, "Login successful", role);
            return ResponseEntity.ok(response);
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Google authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        try {
            UserResponse response = userService.getUserResponse(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
