package com.mis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MedicalFormRequest {
    @NotNull(message = "Medical history is required")
    @Valid
    private MedicalHistory medicalHistory;
    @NotNull(message = "Emergency contact is required")
    @Valid
    private EmergencyContact emergencyContact;
    @Valid
    private EyeExam eyeExam;
    @NotNull(message = "Dental exam is required")
    @Valid
    private DentalExam dentalExam;
    @NotNull(message = "Physical exam is required")
    @Valid
    private PhysicalExam physicalExam;

    @Data
    @NoArgsConstructor
    public static class MedicalHistory {
        @NotBlank(message = "Past hospital admissions cannot be empty")
        private String pastHospitalAdmissions;
        @NotBlank(message = "Chronic illnesses cannot be empty")
        private String chronicIllnesses;
        @NotBlank(message = "Physical disabilities cannot be empty")
        private String physicalDisabilities;
        @NotBlank(message = "Allergies cannot be empty")
        private String allergies;
    }

    @Data
    @NoArgsConstructor
    public static class EmergencyContact {
        @NotBlank(message = "Contact name is required")
        private String name;
        @NotBlank(message = "Address is required")
        private String address;
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^0\\d{9}$", message = "Invalid phone number format. Valid format eg: 0712345678")
        private String phone;
    }

    @Data
    @NoArgsConstructor
    public static class EyeExam {
        private Vision visionWithoutGlasses;
        private Vision visionWithGlasses;
        private String colorVision;
    }

    @Data
    @NoArgsConstructor
    public static class Vision {
        private String right;
        private String left;
    }

    @Data
    @NoArgsConstructor
    public static class DentalExam {
        @NotBlank(message = "Oral health condition is required")
        private String oralHealthCondition;
    }

    @Data
    @NoArgsConstructor
    public static class PhysicalExam {
        @NotNull(message = "Weight is required")
        @Min(value = 1, message = "Weight must be valid")
        @Max(value = 500, message = "Weight exceeds limit")
        private Double weightKg;
        @NotNull(message = "Height is required")
        @Min(value = 30, message = "Height must be valid")
        private Double heightCm;
        @NotNull(message = "BMI is required")
        private Double bmi;
        @NotBlank(message = "Vaccination status is required")
        private String vaccinationStatus;
    }
}