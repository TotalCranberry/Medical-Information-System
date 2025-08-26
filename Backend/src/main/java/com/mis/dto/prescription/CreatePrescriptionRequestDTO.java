package com.mis.dto.prescription;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


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