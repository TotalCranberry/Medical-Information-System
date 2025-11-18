package com.mis.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mis.model.AccountStatus;
import com.mis.model.AuditLog;
import com.mis.model.SupportTicket;
import com.mis.model.Role;
import com.mis.model.User;
import com.mis.service.AdminService;
import com.mis.service.AuditService;
import com.mis.service.SupportTicketService;
import com.mis.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;
    private final UserService userService;
    private final SupportTicketService supportTicketService;

    public AdminController(AdminService adminService, AuditService auditService, UserService userService, SupportTicketService supportTicketService) {
        this.adminService = adminService;
        this.auditService = auditService;
        this.userService = userService;
        this.supportTicketService = supportTicketService;
    }

    /**
     * Endpoint to get all users or filter by status.
     * Example URL for pending users: /api/admin/users?status=PENDING_APPROVAL
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(
            @RequestParam(required = false) Optional<AccountStatus> status,
            @RequestParam(required = false) Optional<Role> role,
            @RequestParam(required = false) Optional<String> searchTerm) {
        List<User> users = adminService.findUsersByCriteria(status, role, searchTerm);
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
    
    /**
     * Endpoint to get all audit logs in descending order of their timestamp.
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(required = false) Optional<String> searchTerm,
            @RequestParam(required = false) Optional<String> startDate,
            @RequestParam(required = false) Optional<String> endDate) {
        List<AuditLog> auditLogs = auditService.findAuditLogsByCriteria(searchTerm, startDate, endDate);
        return ResponseEntity.ok(auditLogs);
    }
    
    /**
     * Endpoint to edit user profile.
     */
    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<?> editUserProfile(@PathVariable String userId, @RequestBody com.mis.dto.ProfileUpdateRequest request) {
        try {
            User updatedUser = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Endpoint to change user password.
     */
    @PutMapping("/users/{userId}/password")
    public ResponseEntity<?> changeUserPassword(@PathVariable String userId, @RequestBody com.mis.dto.PasswordChangeRequest request) {
        try {
            userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to change password"));
        }
    }
    
    /**
     * Endpoint to disable a user account.
     */
    @PutMapping("/users/{userId}/disable")
    public ResponseEntity<?> disableUser(@PathVariable String userId) {
        try {
            User disabledUser = adminService.disableUser(userId);
            return ResponseEntity.ok(disabledUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Endpoint to reactivate a user account.
     */
    @PutMapping("/users/{userId}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable String userId) {
        try {
            User reactivatedUser = adminService.reactivateUser(userId);
            return ResponseEntity.ok(reactivatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Endpoint for an admin to reset a user's password.
     */
    @PutMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable String userId) {
        try {
            adminService.resetPassword(userId);
            // The response does NOT include the password for security.
            // The admin must check the server logs.
            return ResponseEntity.ok(Map.of("message", "Password has been reset. Please check the server logs for the temporary password."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/support-tickets")
    public ResponseEntity<List<SupportTicket>> getSupportTickets(@RequestParam(required = false) Optional<String> status) {
        List<SupportTicket> tickets = supportTicketService.getAllTickets(status);
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/support-tickets/{ticketId}/reply")
    public ResponseEntity<SupportTicket> replyToSupportTicket(@PathVariable String ticketId, @RequestBody Map<String, String> body) {
        SupportTicket ticket = supportTicketService.addReply(ticketId, body.get("reply"));
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/support-tickets/{ticketId}/close")
    public ResponseEntity<SupportTicket> closeSupportTicket(@PathVariable String ticketId) {
        SupportTicket ticket = supportTicketService.closeTicket(ticketId);
        return ResponseEntity.ok(ticket);
    }
}
