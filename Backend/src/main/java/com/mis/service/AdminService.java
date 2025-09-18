package com.mis.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mis.model.AccountStatus;
import com.mis.model.User;
import com.mis.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Fetches users, optionally filtering by their account status.
     * @param status The optional status to filter by (e.g., PENDING_APPROVAL).
     * @return A list of users.
     */
    public List<User> findUsersByStatus(Optional<AccountStatus> status) {
        if (status.isPresent()) {
            return userRepository.findByStatus(status.get());
        } else {
            return userRepository.findAll();
        }
    }

    /**
     * Approves a user by changing their status to ACTIVE.
     * @param userId The ID of the user to approve.
     * @return The updated user object.
     */
    @Transactional
    public User approveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("User is not pending approval.");
        }

        user.setStatus(AccountStatus.ACTIVE);
        return userRepository.save(user);
    }

    /**
     * Disables a user by changing their status to DISABLE.
     * @param userId The ID of the user to approve.
     * @return The updated user object.
     */
    @Transactional
    public User disableUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getStatus() != AccountStatus.DISABLED) {
            throw new IllegalStateException("User is already disable.");
        }

        user.setStatus(AccountStatus.DISABLED);
        return userRepository.save(user);
    }
}
