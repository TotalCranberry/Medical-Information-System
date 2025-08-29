package com.mis.mapper.Prescription;

import com.mis.dto.prescription.PrescriptionItemRequest;
import com.mis.dto.prescription.PrescriptionResponse;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;

import java.util.stream.Collectors;

public class PrescriptionMapper {

    public static PrescriptionResponse toResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .doctorId(p.getDoctorId())
                .doctorName(p.getDoctorName())
                .patientId(p.getPatientId())
                .patientName(p.getPatientName())
                .appointmentId(p.getAppointmentId())
                .generalNotes(p.getNotes())                  // <-- map entity.notes -> dto.generalNotes
                .prescriptionDate(p.getPrescriptionDate())
                .isActive(p.getIsActive())
                .medications(p.getItems() == null ? java.util.List.of()
                        : p.getItems().stream().map(PrescriptionMapper::toItemDto).collect(Collectors.toList()))
                .build();
    }

    private static PrescriptionItemRequest toItemDto(PrescriptionItem i) {
        return PrescriptionItemRequest.builder()
                .medicineId(i.getMedicineId())
                .medicineName(i.getMedicineName())
                .dosage(i.getDosage())
                .timesPerDay(i.getTimesPerDay())
                .durationDays(i.getDurationDays())
                .route(i.getRoute())                         // <-- include route
                .timeOfDay(i.getTimeOfDay())
                .instructions(i.getInstructions())
                .build();
    }
}
