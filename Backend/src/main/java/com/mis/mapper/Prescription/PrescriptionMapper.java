package com.mis.mapper.Prescription;

import com.mis.dto.prescription.PrescriptionItemRequest;
import com.mis.dto.prescription.PrescriptionResponse;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;

import java.util.List;
import java.util.stream.Collectors;

public class PrescriptionMapper {

    public static PrescriptionResponse toResponse(Prescription p) {
        if (p == null) return null;

        return PrescriptionResponse.builder()
                .id(p.getId())
                .doctorId(p.getDoctorId())
                .doctorName(p.getDoctorName())
                .patientId(p.getPatientId())
                .patientName(p.getPatientName())
                .patient(p.getPatient())
                .appointmentId(p.getAppointmentId())
                .generalNotes(p.getNotes())  // map entity.notes -> dto.generalNotes
                .prescriptionDate(p.getPrescriptionDate())
                .isActive(p.getIsActive())
                .medications(p.getItems() == null
                        ? List.of()
                        : p.getItems().stream()
                            .map(PrescriptionMapper::toItemDto)
                            .collect(Collectors.toList()))
                .build();
    }

    private static PrescriptionItemRequest toItemDto(PrescriptionItem i) {
        if (i == null) return null;

        return PrescriptionItemRequest.builder()
                .id(i.getId())                               // ✅ include DB row id
                .medicineId(i.getMedicineId())
                .medicineName(i.getMedicineName())
                .dosage(i.getDosage())
                .timesPerDay(i.getTimesPerDay())
                .durationDays(i.getDurationDays())
                .route(i.getRoute())
                .timeOfDay(i.getTimeOfDay() == null ? List.of() : i.getTimeOfDay())
                .instructions(i.getInstructions())
                .form(i.getForm())
                .strength(i.getStrength())
                .requiredQuantity(i.getRequiredQuantity())    // ✅ new
                .dispensedQuantity(i.getDispensedQuantity())  // ✅ new
                .dispensedStatus(i.getDispensedStatus())      // ✅ new
                .build();
    }
}
