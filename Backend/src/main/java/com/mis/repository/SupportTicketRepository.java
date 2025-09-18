package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.SupportTicket;
import com.mis.model.TicketStatus;
import com.mis.model.User;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
    // Find all tickets with a specific status, ordered by creation date
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<SupportTicket> findBySubmittedByUserOrderByCreatedAtDesc(User user);
}
