package com.mis.service;

import com.mis.model.AccountStatus;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    // CORRECTED CONSTRUCTOR: Added PasswordEncoder
    public AdminService(UserRepository userRepository, AuditService auditService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findUsersByStatus(Optional<AccountStatus> status) {
        if (status.isPresent()) {
            return userRepository.findByStatus(status.get());
        } else {
            return userRepository.findAll();
        }
    }

    @Transactional
    public User approveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("User is not pending approval.");
        }

        user.setStatus(AccountStatus.ACTIVE);
        User savedUser = userRepository.save(user);
        auditService.logAction(savedUser, "USER_APPROVAL", "User approved by admin");
        return savedUser;
    }

    @Transactional
    public User disableUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new IllegalStateException("User is already disabled.");
        }

        user.setStatus(AccountStatus.DISABLED);
        User savedUser = userRepository.save(user);
        auditService.logAction(savedUser, "USER_DISABLE", "User disabled by admin");
        return savedUser;
    }

    /**
     * Resets a user's password to a new temporary password.
     * @param userId The ID of the user whose password will be reset.
     */
    @Transactional
    public void resetPassword(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String temporaryPassword = "P@ssw0rd";
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);

        logger.warn("ADMIN ACTION: Password for user '{}' ({}) has been reset. Temporary Password: {}",
                    user.getName(), user.getEmail(), temporaryPassword);

        auditService.logAction(user, "ADMIN_PASSWORD_RESET", "Password reset by an administrator.");
    }

    /* 
    private String generateTemporaryPassword() {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }*/
}

