package com.mis.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResultDTO {
    
    private Long id;
    private String testName;
    private String result;
    private String referenceRange;
    private String units;
    private Boolean isCritical;
    private String status;
    private String statusDisplayName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Patient information
    private String patientId;
    private String patientName;
    private String patientEmail;
    
    // Lab technician information
    private String uploadedById;
    private String uploadedByName;
    
    // Additional fields for frontend
    private String urgency; // Derived from isCritical
    private String orderDate; // Formatted date for display
    private String orderTime; // Formatted time for display
}