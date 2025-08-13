package com.mis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescription_medications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedication {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;


    @Column(name = "medicine_id", length = 64)
    private String medicineId;

    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;


    @Column(name = "morning_dose", nullable = false)
    private Boolean morningDose = false;

    @Column(name = "afternoon_dose", nullable = false)
    private Boolean afternoonDose = false;

    @Column(name = "evening_dose", nullable = false)
    private Boolean eveningDose = false;

    @Column(name = "night_dose", nullable = false)
    private Boolean nightDose = false;

    @Column(name = "meal_timing", length = 50)
    private String mealTiming;

    @Column(name = "administration_method", length = 50)
    private String administrationMethod;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "quantity_dispensed", nullable = false)
    private Integer quantityDispensed = 0;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "is_dispensed", nullable = false)
    private Boolean isDispensed = false;


    @Column(name = "encrypted_data", columnDefinition = "TEXT")
    private String encryptedData;

    @Column(name = "verification_hash", length = 255)
    private String verificationHash;
}
