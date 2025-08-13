package com.mis.dto.prescription;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mis.model.Prescription;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePrescriptionRequestDTO {

    @NotNull(message = "Patient ID is required")
    private String patientId;

    private String appointmentId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotNull(message = "Medications are required")
    @Valid
    private List<PrescriptionMedicationDTO> medications;

    private String generalNotes;
}