package com.mis.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mis.model.AuditLog;
import com.mis.model.User;
import com.mis.repository.AuditLogRepository;

@Service
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    
    public void logAction(User user, String action, String details) {
        AuditLog auditLog = new AuditLog(user.getEmail(), action, details);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }
    
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> findAuditLogsByCriteria(Optional<String> searchTerm, Optional<String> startDateStr, Optional<String> endDateStr) {
        // Parse dates if present, otherwise keep them null
        LocalDateTime startDate = startDateStr.map(s -> OffsetDateTime.parse(s).toLocalDateTime()).orElse(null);
        LocalDateTime endDate = endDateStr.map(s -> OffsetDateTime.parse(s).toLocalDateTime()).orElse(null);

        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByTimestampDesc();

        return allLogs.stream()
                .filter(log -> searchTerm.isEmpty() || log.getUserEmail().toLowerCase().contains(searchTerm.get().toLowerCase()))
                // Only filter by start date if it is not null
                .filter(log -> startDate == null || !log.getTimestamp().isBefore(startDate))
                // Only filter by end date if it is not null
                .filter(log -> endDate == null || !log.getTimestamp().isAfter(endDate))
                .toList();
    }
}