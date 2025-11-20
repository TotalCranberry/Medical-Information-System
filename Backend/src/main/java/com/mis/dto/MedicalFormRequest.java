package com.mis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MedicalFormRequest {
    private MedicalHistory medicalHistory;
    private EmergencyContact emergencyContact;
    private EyeExam eyeExam;
    private DentalExam dentalExam;
    private PhysicalExam physicalExam;

    @Data
    @NoArgsConstructor
    public static class MedicalHistory {
        private String pastHospitalAdmissions;
        private String chronicIllnesses;
        private String physicalDisabilities;
        private String allergies;
    }

    @Data
    @NoArgsConstructor
    public static class EmergencyContact {
        private String name;
        private String address;
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
        private String oralHealthCondition;
    }

    @Data
    @NoArgsConstructor
    public static class PhysicalExam {
        private String weightKg;
        private String heightCm;
        private String bmi;
        private String vaccinationStatus;
    }
}