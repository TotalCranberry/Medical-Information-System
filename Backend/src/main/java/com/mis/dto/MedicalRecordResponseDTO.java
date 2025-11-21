package com.mis.dto;

import java.util.Map;
import lombok.Data;

@Data
public class MedicalRecordResponseDTO {
    // Medical History
    private String pastHospitalAdmissions;
    private String chronicIllnesses;
    private String physicalDisabilities;
    private String allergies;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactAddress;
    private String emergencyContactPhone;

    // Eye Exam
    private Map<String, String> visionWithoutGlasses;
    private Map<String, String> visionWithGlasses;
    private String colorVision;

    // Dental Exam
    private String oralHealthCondition;

    // Physical Exam
    private String weightKg;
    private String heightCm;
    private String bmi;
    private String vaccinationStatus;

    
}