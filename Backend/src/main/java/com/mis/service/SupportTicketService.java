package com.mis.service;

import com.mis.model.SupportTicket;
import com.mis.model.TicketStatus;
import com.mis.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    public List<SupportTicket> getAllTickets(Optional<String> status) {
        if (status.isPresent() && "OPEN".equalsIgnoreCase(status.get())) {
            return supportTicketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN);
        }
        return supportTicketRepository.findAll();
    }

    public SupportTicket addReply(String ticketId, String reply) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setReply(reply);
        return supportTicketRepository.save(ticket);
    }

    public SupportTicket closeTicket(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(TicketStatus.CLOSED);
        return supportTicketRepository.save(ticket);
    }
}