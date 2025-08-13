package com.mis.dto.prescription;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDTO {

    private String id;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String appointmentId;
    private List<PrescriptionMedicationResponseDTO> medications;
    private String generalNotes;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdated;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedDate;

    private String pharmacistName;
    private String pharmacyNotes;
    private Boolean isActive;
}