package com.mis.configuration;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.mis.model.AccountStatus;
import com.mis.model.AuthMethod;
import com.mis.model.Role;
import com.mis.model.User;
import com.mis.repository.UserRepository;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${mis.admin.email}")
    private String adminEmail;

    @Value("${mis.admin.password}")
    private String adminPassword;
    
    @Value("${mis.admin.name}")
    private String adminName;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Check if an admin user already exists
        if (userRepository.existsByRole(Role.Admin)) {
            logger.info("Admin user already exists. Skipping creation.");
            return;
        }

        // If no admin user exists, create one
        logger.info("No admin user found. Creating initial admin account...");

        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.Admin);
        admin.setAuthMethod(AuthMethod.Manual);
        admin.setStatus(AccountStatus.ACTIVE); // The admin account is active by default
        admin.setLastLogin(LocalDateTime.now());

        userRepository.save(admin);
        logger.info("Initial admin account created successfully with email: {}", adminEmail);
    }
}
