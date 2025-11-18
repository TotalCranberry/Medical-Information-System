package com.mis.mapper;

import java.util.Map;

import com.mis.dto.MedicalRecordResponseDTO;
import com.mis.model.DentalExam;
import com.mis.model.EyeExam;
import com.mis.model.MedicalRecord;
import com.mis.model.PhysicalExam;

public class MedicalRecordMapper {
    public static MedicalRecordResponseDTO toMedicalRecordResponseDTO(
        MedicalRecord record, EyeExam eye, DentalExam dental, PhysicalExam physical
    ) {
        MedicalRecordResponseDTO dto = new MedicalRecordResponseDTO();

        // Map MedicalRecord fields
        dto.setPastHospitalAdmissions(record.getPastHospitalAdmissions());
        dto.setChronicIllnesses(record.getChronicIllnesses());
        dto.setPhysicalDisabilities(record.getPhysicalDisabilities());
        dto.setAllergies(record.getAllergies());
        dto.setEmergencyContactName(record.getEmergencyContactName());
        dto.setEmergencyContactAddress(record.getEmergencyContactAddress());
        dto.setEmergencyContactPhone(record.getEmergencyContactPhone());

        // Map EyeExam fields (if they exist)
        if (eye != null) {
            dto.setVisionWithoutGlasses(Map.of("right", eye.getVisionWithoutGlassesRight(), "left", eye.getVisionWithoutGlassesLeft()));
            dto.setVisionWithGlasses(Map.of("right", eye.getVisionWithGlassesRight(), "left", eye.getVisionWithGlassesLeft()));
            dto.setColorVision(eye.getColorVision());
        }

        // Map DentalExam fields
        if (dental != null) {
            dto.setOralHealthCondition(dental.getOralHealthCondition());
        }

        // Map PhysicalExam fields
        if (physical != null) {
            dto.setWeightKg(physical.getWeightKg());
            dto.setHeightCm(physical.getHeightCm());
            dto.setBmi(physical.getBmi());
            dto.setVaccinationStatus(physical.getVaccinationStatus());
        }
        
        return dto;
    }
}