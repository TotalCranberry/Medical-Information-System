package com.mis.dto.prescription;

import com.mis.model.Prescription;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// DTO for updating prescription status
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionStatusDTO {

    @NotNull(message = "Status is required")
    private Prescription.PrescriptionStatus status;

    private String pharmacyNotes;

    private List<MedicationDispenseDTO> medicationDispenses;
}
