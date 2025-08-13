package com.mis.service;

import com.mis.dto.prescription.*;
import com.mis.mapper.PrescriptionMapper;
import com.mis.model.Prescription;
import com.mis.model.PrescriptionMedication;
import com.mis.repository.PrescriptionRepository;
import com.mis.security.PrescriptionEncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionMapper prescriptionMapper;
    private final PrescriptionEncryptionService encryptionService;


    public PrescriptionResponseDTO createPrescription(CreatePrescriptionRequestDTO requestDTO,
                                                      String doctorId,
                                                      String doctorName) {
        try {
            log.info("Creating prescription for patient: {} by doctor: {}",
                    requestDTO.getPatientName(), doctorName);


            Prescription prescription = prescriptionMapper.toEntity(requestDTO, doctorId, doctorName);


            if (prescription.getMedications() != null) {
                for (PrescriptionMedication m : prescription.getMedications()) {
                    m.setPrescription(prescription);
                }
            }


            if (prescription.getRequestDate() == null) {
                prescription.setRequestDate(LocalDateTime.now());
            }


            if (prescription.getMedications() != null) {
                for (PrescriptionMedication med : prescription.getMedications()) {
                    var encMed = encryptionService.encryptMedication(med);
                    med.setEncryptedData(encMed.getEncryptedData());
                    med.setVerificationHash(encMed.getVerificationHash());
                }
            }


            reEncryptParentSnapshot(prescription);


            Prescription saved = prescriptionRepository.save(prescription);

            log.info("Prescription created successfully with ID: {}", saved.getId());
            return prescriptionMapper.toResponseDTO(saved);

        } catch (Exception e) {
            Throwable t = e;
            while (t.getCause() != null) t = t.getCause();
            log.error("Error creating prescription for patient: {}. Root cause: {}",
                    requestDTO.getPatientName(), t.getMessage(), e);
            throw new RuntimeException("Failed to create prescription: " + t.getMessage(), e);
        }
    }


    @Transactional(readOnly = true)
    public Optional<PrescriptionResponseDTO> getPrescriptionById(String prescriptionId) {
        return prescriptionRepository.findById(prescriptionId)
                .filter(Prescription::getIsActive)
                .map(prescriptionMapper::toResponseDTO);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionResponseDTO> getPrescriptionsByPatientId(String patientId) {
        List<Prescription> prescriptions =
                prescriptionRepository.findByPatientIdAndIsActiveTrueOrderByRequestDateDesc(patientId);
        return prescriptionMapper.toResponseDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionResponseDTO> getPrescriptionsByDoctorId(String doctorId) {
        List<Prescription> prescriptions =
                prescriptionRepository.findByDoctorIdAndIsActiveTrueOrderByRequestDateDesc(doctorId);
        return prescriptionMapper.toResponseDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> getRecentPrescriptionsByDoctor(String doctorId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Prescription> prescriptions =
                prescriptionRepository.findRecentPrescriptionsByDoctor(doctorId, thirtyDaysAgo);
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> getRecentPrescriptionsByPatient(String patientId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Prescription> prescriptions =
                prescriptionRepository.findRecentPrescriptionsByPatient(patientId, thirtyDaysAgo);
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> getPrescriptionsByStatus(Prescription.PrescriptionStatus status) {
        List<Prescription> prescriptions =
                prescriptionRepository.findByStatusAndIsActiveTrueOrderByRequestDateDesc(status);
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public Page<PrescriptionSummaryDTO> getPrescriptionsByStatus(Prescription.PrescriptionStatus status,
                                                                 int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, (sortBy != null ? sortBy : "requestDate"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Prescription> pageData =
                prescriptionRepository.findByStatusAndIsActiveTrue(status, pageable);

        return pageData.map(prescriptionMapper::toSummaryDTO);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> getPrescriptionsForPharmacist() {
        List<Prescription> prescriptions = prescriptionRepository.findPrescriptionsForPharmacist();
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    public PrescriptionResponseDTO updatePrescriptionStatus(String prescriptionId,
                                                            UpdatePrescriptionStatusDTO updateDTO,
                                                            String pharmacistId,
                                                            String pharmacistName) {
        try {
            log.info("Updating prescription status for ID: {} to status: {}",
                    prescriptionId, updateDTO.getStatus());

            Prescription prescription = prescriptionRepository.findById(prescriptionId)
                    .orElseThrow(() -> new RuntimeException("Prescription not found with ID: " + prescriptionId));

            if (!prescription.getIsActive()) {
                throw new RuntimeException("Cannot update inactive prescription");
            }


            prescription.setStatus(updateDTO.getStatus());
            prescription.setPharmacistId(pharmacistId);
            prescription.setPharmacistName(pharmacistName);
            prescription.setPharmacyNotes(updateDTO.getPharmacyNotes());


            if (updateDTO.getStatus() == Prescription.PrescriptionStatus.COMPLETED) {
                prescription.setCompletedDate(LocalDateTime.now());
            }


            if (updateDTO.getMedicationDispenses() != null) {
                updateMedicationDispenses(prescription, updateDTO.getMedicationDispenses());
                reEncryptParentSnapshot(prescription);
            }

            Prescription saved = prescriptionRepository.save(prescription);

            log.info("Prescription status updated successfully for ID: {}", prescriptionId);
            return prescriptionMapper.toResponseDTO(saved);

        } catch (Exception e) {
            Throwable t = e;
            while (t.getCause() != null) t = t.getCause();
            log.error("Error updating prescription status for ID: {}. Root cause: {}",
                    prescriptionId, t.getMessage(), e);
            throw new RuntimeException("Failed to update prescription status: " + t.getMessage(), e);
        }
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> searchPrescriptionsByPatientName(String patientName) {
        List<Prescription> prescriptions =
                prescriptionRepository.findByPatientNameContainingIgnoreCase(patientName);
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public Optional<PrescriptionResponseDTO> getPrescriptionByAppointmentId(String appointmentId) {
        return prescriptionRepository.findByAppointmentIdAndIsActiveTrue(appointmentId)
                .map(prescriptionMapper::toResponseDTO);
    }


    @Transactional(readOnly = true)
    public List<PrescriptionSummaryDTO> getOverduePrescriptions() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<Prescription> prescriptions =
                prescriptionRepository.findOverduePrescriptions(twentyFourHoursAgo);
        return prescriptionMapper.toSummaryDTOList(prescriptions);
    }


    @Transactional(readOnly = true)
    public PrescriptionStatisticsDTO getPrescriptionStatistics() {
        Object[] stats = prescriptionRepository.getPrescriptionStatistics();
        if (stats.length > 0 && stats[0] != null) {
            Object[] result = (Object[]) stats[0];
            return new PrescriptionStatisticsDTO(
                    ((Number) result[0]).longValue(), // requested
                    ((Number) result[1]).longValue(), // pending
                    ((Number) result[2]).longValue(), // inProgress
                    ((Number) result[3]).longValue()  // completed
            );
        }
        return new PrescriptionStatisticsDTO(0L, 0L, 0L, 0L);
    }


    @Transactional(readOnly = true)
    public PrescriptionStatisticsDTO getDoctorPrescriptionStatistics(String doctorId) {
        Object[] stats = prescriptionRepository.getDoctorPrescriptionStatistics(doctorId);
        if (stats.length > 0 && stats[0] != null) {
            Object[] result = (Object[]) stats[0];
            return new PrescriptionStatisticsDTO(
                    ((Number) result[0]).longValue(), // requested
                    ((Number) result[1]).longValue(), // pending
                    ((Number) result[2]).longValue(), // inProgress
                    ((Number) result[3]).longValue()  // completed
            );
        }
        return new PrescriptionStatisticsDTO(0L, 0L, 0L, 0L);
    }


    public void deletePrescription(String prescriptionId, String doctorId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found with ID: " + prescriptionId));

        if (!prescription.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Access denied: You can only delete your own prescriptions");
        }
        if (prescription.getStatus() != Prescription.PrescriptionStatus.REQUESTED) {
            throw new RuntimeException("Cannot delete prescription that is already being processed");
        }

        prescription.setIsActive(false);
        prescriptionRepository.save(prescription);

        log.info("Prescription soft deleted: ID {}", prescriptionId);
    }



    private void updateMedicationDispenses(Prescription prescription, List<MedicationDispenseDTO> dispenses) {
        for (MedicationDispenseDTO dispense : dispenses) {
            Optional<PrescriptionMedication> medicationOpt = prescription.getMedications().stream()
                    .filter(med -> med.getId().equals(dispense.getPrescriptionMedicationId()))
                    .findFirst();

            if (medicationOpt.isPresent()) {
                PrescriptionMedication medication = medicationOpt.get();
                medication.setQuantityDispensed(dispense.getQuantityDispensed());
                medication.setUnitPrice(dispense.getUnitPrice());
                medication.setTotalPrice(dispense.getTotalPrice());
                medication.setIsDispensed(true);


                var encMed = encryptionService.encryptMedication(medication);
                medication.setEncryptedData(encMed.getEncryptedData());
                medication.setVerificationHash(encMed.getVerificationHash());
            }
        }
    }

    private void reEncryptParentSnapshot(Prescription prescription) {
        var meds = prescription.getMedications();
        var enc = encryptionService.encryptMedications(meds != null ? meds : List.of());
        prescription.setEncryptedData(enc.getEncryptedData());
        prescription.setVerificationHash(enc.getVerificationHash());
    }


    public static class PrescriptionStatisticsDTO {
        public final Long requested;
        public final Long pending;
        public final Long inProgress;
        public final Long completed;

        public PrescriptionStatisticsDTO(Long requested, Long pending, Long inProgress, Long completed) {
            this.requested = requested;
            this.pending = pending;
            this.inProgress = inProgress;
            this.completed = completed;
        }
    }
}
