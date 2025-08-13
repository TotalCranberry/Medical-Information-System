package com.mis.dto.prescription;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicationResponseDTO {

    private String id;
    private String medicineId;
    private String medicineName;
    private String dosage;
    private Integer durationDays;
    private TimingDTO timings;
    private String mealTiming;
    private String administrationMethod;
    private String remarks;
    private Integer quantityDispensed;
    private Double unitPrice;
    private Double totalPrice;
    private Boolean isDispensed;
}