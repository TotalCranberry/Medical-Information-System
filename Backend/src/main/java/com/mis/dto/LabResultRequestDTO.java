package com.mis.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResultRequestDTO {
    
    @NotBlank(message = "Test name is required")
    private String testName;
    
    private String result;
    
    private String referenceRange;
    
    private String units;
    
    private Boolean isCritical;
    
    @NotBlank(message = "Patient ID is required")
    private String patientId;
    
    @NotBlank(message = "Lab technician ID is required")
    private String uploadedById;
    
    // For updating existing results
    private Long id;
}