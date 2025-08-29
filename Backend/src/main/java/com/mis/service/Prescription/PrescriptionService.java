package com.mis.service.Prescription;

import com.mis.dto.prescription.PrescriptionCreateRequest;
import com.mis.dto.prescription.PrescriptionItemRequest;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;
import com.mis.model.User;
import com.mis.repository.Prescription.PrescriptionRepository;
import com.mis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    /**
     * Create a prescription authored by the given doctor for the given request.
     * The controller should pass the authenticated doctor's id/name.
     *
     * @param doctorId   authenticated doctor's user id (will be encrypted at-rest)
     * @param doctorName authenticated doctor's display name (encrypted at-rest)
     * @param req        request payload from frontend
     * @return persisted Prescription entity (items populated)
     */
    @Transactional
    public Prescription create(String doctorId, String doctorName, PrescriptionCreateRequest req) {
        validateCreateRequest(req);

        // Ensure patient exists (also gives us the FK entity)
        User patient = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + req.getPatientId()));

        // Build root entity
        Date now = new Date();
        Prescription p = new Prescription();
        p.setId(UUID.randomUUID().toString());
        p.setPatient(patient);                       // strong FK
        p.setPatientId(req.getPatientId());         // encrypted string copy
        p.setPatientName(nullToEmpty(req.getPatientName())); // encrypted
        p.setDoctorId(doctorId);                    // encrypted
        p.setDoctorName(doctorName);                // encrypted
        p.setAppointmentId(nullToEmpty(req.getAppointmentId())); // encrypted
        p.setNotes(nullToEmpty(req.getGeneralNotes()));          // encrypted
        p.setPrescriptionDate(now);
        p.setIsActive(Boolean.TRUE);

        // Build child items (validate required enum fields)
        List<PrescriptionItem> items = new ArrayList<>();
        for (int i = 0; i < req.getMedications().size(); i++) {
            PrescriptionItemRequest m = req.getMedications().get(i);

            // Skip blank rows (both id and name missing)
            boolean noName = (m.getMedicineName() == null || m.getMedicineName().isBlank());
            boolean noId   = (m.getMedicineId() == null || m.getMedicineId().isBlank());
            if (noName && noId) {
                continue;
            }

            // Validate required fields with specific error messages
            String medicineInfo = m.getMedicineName() != null ? m.getMedicineName() :
                                (m.getMedicineId() != null ? m.getMedicineId() : "Medication " + (i + 1));

            if (m.getRoute() == null) {
                throw new IllegalArgumentException(
                    String.format("Route of administration is required for '%s'. Valid values are: ORAL, INTRAVENOUS, INTRAMUSCULAR, SUBCUTANEOUS, TOPICAL, INHALATION, RECTAL, VAGINAL, OPHTHALMIC, OTIC",
                        medicineInfo));
            }
            if (m.getTimeOfDay() == null || m.getTimeOfDay().isEmpty()) {
                throw new IllegalArgumentException(
                    String.format("At least one time of day is required for '%s'. Valid values are: MORNING, AFTERNOON, EVENING, NIGHT, BEFORE_MEALS, AFTER_MEALS, WITH_MEALS, AS_NEEDED",
                        medicineInfo));
            }

            PrescriptionItem it = PrescriptionItem.builder()
                    .prescription(p)
                    .medicineId(trimOrNull(m.getMedicineId()))
                    .medicineName(trimOrNull(m.getMedicineName()))
                    .dosage(trimOrNull(m.getDosage()))
                    .timesPerDay(trimOrNull(m.getTimesPerDay()))
                    .durationDays(trimOrNull(m.getDurationDays()))
                    .route(m.getRoute())
                    .timeOfDay(m.getTimeOfDay())
                    .instructions(trimOrNull(m.getInstructions()))
                    .build();

            items.add(it);
        }

        if (items.isEmpty()) {
            throw new IllegalArgumentException("At least one valid medication entry is required.");
        }

        p.setItems(items); // CascadeType.ALL will persist children

        // Persist and return (JPA converters will encrypt annotated fields)
        return prescriptionRepository.save(p);
    }

    /**
     * Convenience read for controllers/services that need the full entity (decrypted by converter).
     */
    @Transactional(readOnly = true)
    public Prescription getByIdOrThrow(String prescriptionId) {
        return prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NoSuchElementException("Prescription not found: " + prescriptionId));
    }

    // -------------------- helpers --------------------

    private void validateCreateRequest(PrescriptionCreateRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (req.getPatientId() == null || req.getPatientId().isBlank()) {
            throw new IllegalArgumentException("patientId is required.");
        }
        if (req.getMedications() == null || req.getMedications().isEmpty()) {
            throw new IllegalArgumentException("medications list cannot be empty.");
        }
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String nullToEmpty(String s) {
        return (s == null) ? "" : s;
    }
}
