package com.mis.mapper;

import com.mis.dto.LabResultDTO;
import com.mis.dto.LabResultRequestDTO;
import com.mis.dto.LabResultStatsDTO;
import com.mis.model.LabResult;
import com.mis.model.User;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class LabResultMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, HH:mm");

    // ========== Entity to DTO Conversion ==========
    
    /**
     * Convert LabResult entity to LabResultDTO
     */
    public static LabResultDTO toDto(LabResult labResult) {
        if (labResult == null) return null;
        
        return LabResultDTO.builder()
                .id(labResult.getId())
                .testName(labResult.getTestName())
                .result(labResult.getResult())
                .referenceRange(labResult.getReferenceRange())
                .units(labResult.getUnits())
                .isCritical(labResult.getIsCritical())
                .status(labResult.getStatus() != null ? labResult.getStatus().name() : null)
                .statusDisplayName(labResult.getStatus() != null ? labResult.getStatus().getDisplayName() : null)
                .createdAt(labResult.getCreatedAt())
                
                // Patient information
                .patientId(labResult.getPatient() != null ? labResult.getPatient().getId() : null)
                .patientName(labResult.getPatient() != null ? labResult.getPatient().getName() : null)
                .patientEmail(labResult.getPatient() != null ? labResult.getPatient().getEmail() : null)
                
                // Lab technician information
                .uploadedById(labResult.getUploadedBy() != null ? labResult.getUploadedBy().getId() : null)
                .uploadedByName(labResult.getUploadedBy() != null ? labResult.getUploadedBy().getName() : null)
                
                // Additional frontend fields
                .urgency(labResult.getIsCritical() != null && labResult.getIsCritical() ? "Urgent" : "Routine")
                .orderDate(labResult.getCreatedAt() != null ? labResult.getCreatedAt().format(DATE_FORMATTER) : null)
                .orderTime(labResult.getCreatedAt() != null ? labResult.getCreatedAt().format(TIME_FORMATTER) : null)
                .build();
    }
    
    /**
     * Convert LabResult entity to LabResultDTO with detailed formatting
     */
    public static LabResultDTO toDtoWithFormatting(LabResult labResult) {
        if (labResult == null) return null;
        
        LabResultDTO dto = toDto(labResult);
        
        // Enhanced formatting for frontend display
        if (labResult.getCreatedAt() != null) {
            String formattedDateTime = labResult.getCreatedAt().format(DATETIME_FORMATTER);
            dto.setOrderDate(formattedDateTime);
        }
        
        return dto;
    }
    
    /**
     * Convert list of LabResult entities to DTOs
     */
    public static List<LabResultDTO> toDtoList(List<LabResult> labResults) {
        if (labResults == null) return null;
        
        return labResults.stream()
                .map(LabResultMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert list of LabResult entities to DTOs with formatting
     */
    public static List<LabResultDTO> toDtoListWithFormatting(List<LabResult> labResults) {
        if (labResults == null) return null;
        
        return labResults.stream()
                .map(LabResultMapper::toDtoWithFormatting)
                .collect(Collectors.toList());
    }

    // ========== DTO to Entity Conversion ==========
    
    /**
     * Convert LabResultRequestDTO to LabResult entity
     */
    public static LabResult toEntity(LabResultRequestDTO dto, User patient, User labTechnician) {
        if (dto == null) return null;
        
        return LabResult.builder()
                .id(dto.getId())
                .testName(dto.getTestName())
                .result(dto.getResult())
                .referenceRange(dto.getReferenceRange())
                .units(dto.getUnits())
                .isCritical(dto.getIsCritical())
                .patient(patient)
                .uploadedBy(labTechnician)
                .build();
    }
    
    /**
     * Update existing LabResult entity with DTO data
     */
    public static void updateEntityFromDto(LabResult existingEntity, LabResultRequestDTO dto) {
        if (existingEntity == null || dto == null) return;
        
        if (dto.getTestName() != null) {
            existingEntity.setTestName(dto.getTestName());
        }
        if (dto.getResult() != null) {
            existingEntity.setResult(dto.getResult());
        }
        if (dto.getReferenceRange() != null) {
            existingEntity.setReferenceRange(dto.getReferenceRange());
        }
        if (dto.getUnits() != null) {
            existingEntity.setUnits(dto.getUnits());
        }
        if (dto.getIsCritical() != null) {
            existingEntity.setIsCritical(dto.getIsCritical());
        }
    }

    // ========== Statistics Mapping ==========
    
    /**
     * Create LabResultStatsDTO from individual counts
     */
    public static LabResultStatsDTO toStatsDto(
            long pendingCount,
            long completedCount,
            long criticalPendingCount,
            long todayCount,
            long weekCount,
            long monthCount) {
        
        return LabResultStatsDTO.builder()
                .newRequests(pendingCount)
                .inProgress(0) // This would be calculated based on business logic
                .completed(completedCount)
                .pending(pendingCount) // Awaiting review
                .criticalPending(criticalPendingCount)
                .totalToday(todayCount)
                .totalThisWeek(weekCount)
                .totalThisMonth(monthCount)
                .build();
    }
    
    /**
     * Create simplified stats DTO for dashboard cards
     */
    public static LabResultStatsDTO toSimpleStatsDto(long pending, long completed, long critical, long today) {
        return LabResultStatsDTO.builder()
                .newRequests(pending)
                .inProgress(critical) // Using critical as "in progress" priority
                .completed(completed)
                .pending(pending)
                .totalToday(today)
                .build();
    }

    // ========== Helper Methods ==========
    
    /**
     * Convert status enum to display string for frontend
     */
    public static String getStatusDisplayName(LabResult.LabResultStatus status) {
        if (status == null) return "Unknown";
        return status.getDisplayName();
    }
    
    /**
     * Get urgency level based on critical flag and status
     */
    public static String getUrgencyLevel(Boolean isCritical, LabResult.LabResultStatus status) {
        if (isCritical != null && isCritical) {
            return "Urgent";
        }
        if (status == LabResult.LabResultStatus.PENDING) {
            return "Routine";
        }
        return "Normal";
    }
    
    /**
     * Format date for frontend display
     */
    public static String formatDateForDisplay(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return null;
        
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate resultDate = dateTime.toLocalDate();
        
        if (resultDate.equals(today)) {
            return "Today, " + dateTime.format(TIME_FORMATTER);
        } else if (resultDate.equals(today.minusDays(1))) {
            return "Yesterday, " + dateTime.format(TIME_FORMATTER);
        } else {
            return dateTime.format(DATETIME_FORMATTER);
        }
    }
}