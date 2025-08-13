package com.mis.dto.prescription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicationDTO {

    private String medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotNull(message = "Duration days is required")
    @Positive(message = "Duration must be positive")
    private Integer durationDays;

    private TimingDTO timings;

    private String mealTiming;

    private String administrationMethod;

    private String remarks;


}