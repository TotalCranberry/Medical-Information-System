package com.mis.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mis.model.AccountStatus;
import com.mis.model.User;
import com.mis.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Endpoint to get all users or filter by status.
     * Example URL for pending users: /api/admin/users?status=PENDING_APPROVAL
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) Optional<AccountStatus> status) {
        List<User> users = adminService.findUsersByStatus(status);
        return ResponseEntity.ok(users);
    }

    /**
     * Endpoint to approve a user.
     */
    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable String userId) {
        try {
            User approvedUser = adminService.approveUser(userId);
            return ResponseEntity.ok(approvedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
