package com.mis.dto.prescription;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDispenseDTO {

    @NotNull(message = "Prescription medication ID is required")
    private String prescriptionMedicationId;

    @NotNull(message = "Quantity dispensed is required")
    @Positive(message = "Quantity dispensed must be positive")
    private Integer quantityDispensed;

    private Double unitPrice;

    private Double totalPrice;
}