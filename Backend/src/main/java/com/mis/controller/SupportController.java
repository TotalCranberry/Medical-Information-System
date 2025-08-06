package com.mis.controller;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mis.dto.SupportRequest;
import com.mis.model.SupportTicket;
import com.mis.model.TicketStatus;
import com.mis.model.User;
import com.mis.repository.SupportTicketRepository;
import com.mis.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    public SupportController(SupportTicketRepository supportTicketRepository, UserRepository userRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitSupportRequest(Authentication authentication, @Valid @RequestBody SupportRequest request) {
        String userId = authentication.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setSubmittedByUser(user);
        ticket.setMessage(request.getMessage());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(new Date());

        supportTicketRepository.save(ticket);

        return ResponseEntity.ok().body("Support request received successfully.");
    }

    // New endpoint for Admins
    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getOpenTickets() {
        List<SupportTicket> openTickets = supportTicketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN);
        return ResponseEntity.ok(openTickets);
    }
}
