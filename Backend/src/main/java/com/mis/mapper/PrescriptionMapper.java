package com.mis.mapper;

import com.mis.dto.prescription.*;
import com.mis.model.Prescription;
import com.mis.model.PrescriptionMedication;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PrescriptionMapper {


    public Prescription toEntity(CreatePrescriptionRequestDTO dto, String doctorId, String doctorName) {
        Prescription prescription = new Prescription();
        prescription.setPatientId(dto.getPatientId());
        prescription.setPatientName(dto.getPatientName());
        prescription.setDoctorId(doctorId);
        prescription.setDoctorName(doctorName);
        prescription.setAppointmentId(dto.getAppointmentId());
        prescription.setGeneralNotes(dto.getGeneralNotes());
        prescription.setStatus(Prescription.PrescriptionStatus.REQUESTED);
        prescription.setIsActive(true);


        List<PrescriptionMedicationDTO> medsDto = dto.getMedications();
        if (medsDto != null && !medsDto.isEmpty()) {
            List<PrescriptionMedication> medications = medsDto.stream()
                    .map(medDto -> toPrescriptionMedicationEntity(medDto, prescription))
                    .collect(Collectors.toList());
            prescription.setMedications(medications);
        } else {
            prescription.setMedications(new ArrayList<>());
        }

        return prescription;
    }

    public PrescriptionMedication toPrescriptionMedicationEntity(PrescriptionMedicationDTO dto,
                                                                 Prescription prescription) {
        PrescriptionMedication medication = new PrescriptionMedication();


        medication.setPrescription(prescription);


        medication.setMedicineId(dto.getMedicineId());
        medication.setMedicineName(dto.getMedicineName());


        medication.setDosage(dto.getDosage());
        medication.setDurationDays(dto.getDurationDays());


        medication.setMealTiming(dto.getMealTiming());
        medication.setAdministrationMethod(dto.getAdministrationMethod());
        medication.setRemarks(dto.getRemarks());


        if (medication.getQuantityDispensed() == null) medication.setQuantityDispensed(0);
        if (medication.getIsDispensed() == null) medication.setIsDispensed(false);

        TimingDTO t = dto.getTimings();
        boolean morning   = t != null && Boolean.TRUE.equals(t.getMorning());
        boolean afternoon = t != null && Boolean.TRUE.equals(t.getAfternoon());
        boolean evening   = t != null && Boolean.TRUE.equals(t.getEvening());
        boolean night     = t != null && Boolean.TRUE.equals(t.getNight());
        medication.setMorningDose(morning);
        medication.setAfternoonDose(afternoon);
        medication.setEveningDose(evening);
        medication.setNightDose(night);

        return medication;
    }


    public PrescriptionResponseDTO toResponseDTO(Prescription prescription) {
        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setId(prescription.getId());
        dto.setPatientId(prescription.getPatientId());
        dto.setPatientName(prescription.getPatientName());
        dto.setDoctorId(prescription.getDoctorId());
        dto.setDoctorName(prescription.getDoctorName());
        dto.setAppointmentId(prescription.getAppointmentId());
        dto.setGeneralNotes(prescription.getGeneralNotes());

        dto.setStatus(prescription.getStatus().getDisplayName());
        dto.setRequestDate(prescription.getRequestDate());
        dto.setLastUpdated(prescription.getLastUpdated());
        dto.setCompletedDate(prescription.getCompletedDate());
        dto.setPharmacistName(prescription.getPharmacistName());
        dto.setPharmacyNotes(prescription.getPharmacyNotes());
        dto.setIsActive(prescription.getIsActive());


        if (prescription.getMedications() != null) {
            List<PrescriptionMedicationResponseDTO> medicationDTOs = prescription.getMedications().stream()
                    .map(this::toPrescriptionMedicationResponseDTO)
                    .collect(Collectors.toList());
            dto.setMedications(medicationDTOs);
        } else {
            dto.setMedications(new ArrayList<>());
        }

        return dto;
    }

    public PrescriptionMedicationResponseDTO toPrescriptionMedicationResponseDTO(PrescriptionMedication medication) {
        PrescriptionMedicationResponseDTO dto = new PrescriptionMedicationResponseDTO();
        dto.setId(medication.getId());
        dto.setMedicineId(medication.getMedicineId());
        dto.setMedicineName(medication.getMedicineName());
        dto.setDosage(medication.getDosage());
        dto.setDurationDays(medication.getDurationDays());
        dto.setMealTiming(medication.getMealTiming());
        dto.setAdministrationMethod(medication.getAdministrationMethod());
        dto.setRemarks(medication.getRemarks());

        dto.setQuantityDispensed(medication.getQuantityDispensed());
        dto.setUnitPrice(medication.getUnitPrice());
        dto.setTotalPrice(medication.getTotalPrice());
        dto.setIsDispensed(Boolean.TRUE.equals(medication.getIsDispensed()));


        TimingDTO timings = new TimingDTO();
        timings.setMorning(Boolean.TRUE.equals(medication.getMorningDose()));
        timings.setAfternoon(Boolean.TRUE.equals(medication.getAfternoonDose()));
        timings.setEvening(Boolean.TRUE.equals(medication.getEveningDose()));
        timings.setNight(Boolean.TRUE.equals(medication.getNightDose()));
        dto.setTimings(timings);

        return dto;
    }

    public PrescriptionSummaryDTO toSummaryDTO(Prescription prescription) {
        PrescriptionSummaryDTO dto = new PrescriptionSummaryDTO();
        dto.setId(prescription.getId());
        dto.setPatientName(prescription.getPatientName());
        dto.setDoctorName(prescription.getDoctorName());
        dto.setStatus(prescription.getStatus().getDisplayName());
        dto.setRequestDate(prescription.getRequestDate());
        dto.setCompletedDate(prescription.getCompletedDate());
        dto.setIsActive(prescription.getIsActive());
        dto.setMedicationCount(
                prescription.getMedications() != null ? prescription.getMedications().size() : 0
        );
        return dto;
    }

    public List<PrescriptionResponseDTO> toResponseDTOList(List<Prescription> prescriptions) {
        if (prescriptions == null || prescriptions.isEmpty()) return new ArrayList<>();
        return prescriptions.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<PrescriptionSummaryDTO> toSummaryDTOList(List<Prescription> prescriptions) {
        if (prescriptions == null || prescriptions.isEmpty()) return new ArrayList<>();
        return prescriptions.stream().map(this::toSummaryDTO).collect(Collectors.toList());
    }
}
