package com.mis.mapper;

import java.util.HashMap;
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

        // Map EyeExam fields 
        if (eye != null) {
            dto.setVisionWithoutGlasses(createMap(
                "right", eye.getVisionWithoutGlassesRight(), 
                "left", eye.getVisionWithoutGlassesLeft()
            ));
            dto.setVisionWithGlasses(createMap(
                "right", eye.getVisionWithGlassesRight(), 
                "left", eye.getVisionWithGlassesLeft()
            ));
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

    private static Map<String, String> createMap(String k1, String v1, String k2, String v2) {
        Map<String, String> map = new HashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        return map;
    }
}