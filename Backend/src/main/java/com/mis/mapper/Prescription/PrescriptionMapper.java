package com.mis.mapper.Prescription;

import com.mis.dto.Prescription.PrescriptionItemRequest;
import com.mis.dto.Prescription.PrescriptionResponse;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;

import java.util.List;
import java.util.stream.Collectors;

public class PrescriptionMapper {

    private static StudentRepository studentRepository;
    private static StaffRepository staffRepository;

    // Inject repositories via setter or constructor if needed, but for static, perhaps use service
    // For simplicity, assume we can access via static or modify to non-static

    public static PrescriptionResponse toResponse(Prescription p, StudentRepository studentRepo, StaffRepository staffRepo) {
        if (p == null) return null;

        Integer patientAge = null;
        String patientGender = null;

        if (p.getPatient() != null) {
            if (p.getPatient().getRole() == Role.Student) {
                Student student = studentRepo.findById(p.getPatient().getId()).orElse(null);
                if (student != null) {
                    patientAge = student.getAge();
                    patientGender = student.getGender();
                }
            } else if (p.getPatient().getRole() == Role.Staff) {
                Staff staff = staffRepo.findById(p.getPatient().getId()).orElse(null);
                if (staff != null) {
                    patientAge = staff.getAge();
                    patientGender = staff.getGender();
                }
            }
        }

        return PrescriptionResponse.builder()
                .id(p.getId())
                .doctorId(p.getDoctorId())
                .doctorName(p.getDoctorName())
                .patientId(p.getPatientId())
                .patientName(p.getPatientName())
                .patient(p.getPatient())
                .patientAge(patientAge)
                .patientGender(patientGender)
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
