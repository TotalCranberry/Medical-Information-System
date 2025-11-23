package com.mis.service.Prescription;

import com.mis.dto.Prescription.PrescriptionCreateRequest;
import com.mis.dto.Prescription.PrescriptionItemRequest;
import com.mis.dto.Prescription.ManualDispenseRequest;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;
import com.mis.model.Role;
import com.mis.model.User;
import com.mis.model.Medicine.Medicine;
import com.mis.model.enums.RouteOfAdministration;
import com.mis.model.enums.TimeOfDay;
import com.mis.repository.Prescription.PrescriptionItemRepository;
import com.mis.repository.Prescription.PrescriptionRepository;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.repository.UserRepository;
import com.mis.repository.Medicine.MedicineRepository;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final MedicineRepository medicineRepository;
    private final com.mis.service.Invoice.InvoiceService invoiceService;

    /**
     * Create a prescription authored by the given doctor for the given request.
     * The controller should pass the authenticated doctor's id/name.
     */
    @Transactional
    public Prescription create(String doctorId, String doctorName, PrescriptionCreateRequest req,
                              byte[] doctorSignature, String doctorSignatureContentType,
                              byte[] doctorSeal, String doctorSealContentType) {
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
        p.setNotes(trimOrNull(req.getGeneralNotes()));          // encrypted - store null if empty
        p.setPrescriptionDate(now);
        p.setIsActive(Boolean.TRUE);

        // Build child items
        List<PrescriptionItem> items = new ArrayList<>();
        for (int i = 0; i < req.getMedications().size(); i++) {
            PrescriptionItemRequest m = req.getMedications().get(i);

            boolean noName = (m.getMedicineName() == null || m.getMedicineName().isBlank());
            boolean noId   = (m.getMedicineId() == null || m.getMedicineId().isBlank());
            if (noName && noId) continue;

            String medicineInfo = m.getMedicineName() != null ? m.getMedicineName()
                    : (m.getMedicineId() != null ? m.getMedicineId() : "Medication " + (i + 1));

            // Optional: Route of administration (default to ORAL if not specified)
            if (m.getRoute() == null) {
                // Set default route if not provided
            }

            // Optional: Time of day (can be empty/null)
            // No validation required for time of day

            PrescriptionItem it = PrescriptionItem.builder()
                    .prescription(p)
                    .medicineId(trimOrNull(m.getMedicineId()))
                    .medicineName(trimOrNull(m.getMedicineName()))
                    .dosage(trimOrNull(m.getDosage()))
                    .timesPerDay(trimOrNull(m.getTimesPerDay()))
                    .durationDays(trimOrNull(m.getDurationDays()))
                    .route(m.getRoute() != null ? m.getRoute() : RouteOfAdministration.ORAL)
                    .timeOfDay(m.getTimeOfDay() != null ? m.getTimeOfDay() : new ArrayList<>())
                    .instructions(trimOrNull(m.getInstructions()))
                    .form(trimOrNull(m.getForm()))
                    .strength(trimOrNull(m.getStrength()))
                    .build();

            items.add(it);
        }

        if (items.isEmpty()) {
            throw new IllegalArgumentException("At least one valid medication entry is required.");
        }

        p.setItems(items); // CascadeType.ALL will persist children

        // Set signature and seal
        p.setDoctorSignature(doctorSignature);
        p.setDoctorSignatureContentType(doctorSignatureContentType);
        p.setDoctorSeal(doctorSeal);
        p.setDoctorSealContentType(doctorSealContentType);

        return prescriptionRepository.save(p);
    }

    /**
     * Read full entity (fields auto-decrypted by the JPA converter).
     */
    @Transactional(readOnly = true)
    public Prescription getByIdOrThrow(String prescriptionId) {
        return prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NoSuchElementException("Prescription not found: " + prescriptionId));
    }

    /**
     * Read prescription as DTO (safe for JSON serialization, avoids Hibernate proxy issues).
     */
    @Transactional(readOnly = true)
    public com.mis.dto.Prescription.PrescriptionResponse getByIdAsDto(String prescriptionId) {
        Prescription prescription = getByIdOrThrow(prescriptionId);
        return com.mis.mapper.Prescription.PrescriptionMapper.toResponse(prescription, studentRepository, staffRepository);
    }

    /**
     * Queue for pharmacy: all active prescriptions ordered by date (desc).
     * Use this for the "Pending" table.
     */
    @Transactional(readOnly = true)
    public List<Prescription> getPendingQueue() {
        return prescriptionRepository.findByIsActiveOrderByPrescriptionDateDesc(true);
    }

    /**
     * Lightweight queue rows (optional convenience for the controller).
     */
    @Transactional(readOnly = true)
    public List<QueueRow> getPendingQueueLite() {
        List<Prescription> list = getPendingQueue();
        List<QueueRow> out = new ArrayList<>();
        for (Prescription p : list) {
            out.add(QueueRow.builder()
                    .id(p.getId())
                    .patientId(p.getPatient() != null ? p.getPatient().getId() : p.getPatientId())
                    .patientName(p.getPatientName())
                    .doctorName(p.getDoctorName())
                    .itemCount(p.getItems() == null ? 0 : p.getItems().size())
                    .createdAt(p.getPrescriptionDate())
                    .build());
        }
        return out;
    }
    /**
     * Queue for pharmacy: all inactive prescriptions ordered by date (desc).
     * Use this for the "Completed" table.
     */
    @Transactional(readOnly = true)
    public List<Prescription> getCompletedPrescriptions() {
        return prescriptionRepository.findByIsActiveOrderByPrescriptionDateDesc(false);
    }

    /**
     * Dispense a prescription:
     *  - decrement stock for each item (best-effort)
     *  - mark prescription inactive (completed)
     * Returns a per-item summary usable by the UI.
     */
    @Transactional
    public DispenseSummary dispenseAndComplete(String prescriptionId) {
        Prescription p = getByIdOrThrow(prescriptionId);

        List<ItemResult> results = new ArrayList<>();
        if (p.getItems() != null) {
            for (PrescriptionItem it : p.getItems()) {
                String name = safe(it.getMedicineName());
                int requested = resolveRequestedQty(it);
                ItemResult r = new ItemResult();
                r.setItemId(String.valueOf(it.getId())); // Fixed: Convert Long to String
                r.setMedicineName(name);
                r.setRequestedQty(requested);

                if (name.isBlank() || requested <= 0) {
                    r.setDispensedQty(0);
                    r.setNote("Skipped: no name/qty");
                } else {
                    int disp = decrementStockByName(name, requested);
                    r.setDispensedQty(disp);
                    it.setRequiredQuantity(requested);
                    it.setDispensedQuantity(disp);
                    it.setDispensedStatus(disp > 0 ? 1 : 0);
                    prescriptionItemRepository.save(it);
                    if (disp == requested) r.setNote("OK");
                    else if (disp == 0) r.setNote("Not in inventory / 0 stock");
                    else r.setNote("Partial (insufficient stock)");
                }
                results.add(r);
            }
        }

        p.setIsActive(false);
        prescriptionRepository.save(p);

        return DispenseSummary.builder()
                .prescriptionId(p.getId())
                .completed(true)
                .results(results)
                .build();
    }

    /**
     * Manual dispense: pharmacist selects specific items and quantities to decrement.
     * Does NOT mark the prescription as completed; used for partial dispensing.
     */
    @Transactional
    public DispenseSummary dispenseManual(String prescriptionId, ManualDispenseRequest req) {
        Prescription p = getByIdOrThrow(prescriptionId);

        List<ItemResult> results = new ArrayList<>();
        Map<Long, PrescriptionItem> itemById = new HashMap<>();
        if (p.getItems() != null) {
            for (PrescriptionItem it : p.getItems()) {
                if (it.getId() != null) {
                    itemById.put(it.getId(), it);
                }
            }
        }

        if (req != null && req.getItems() != null) {
            for (ManualDispenseRequest.Item in : req.getItems()) {
                Long itemId = in.getItemId();
                Integer qty = in.getQuantity();
                PrescriptionItem entityItem = (itemId != null) ? itemById.get(itemId) : null;

                String name = safe(in.getMedicineName());
                if (name.isBlank() && entityItem != null) {
                    name = safe(entityItem.getMedicineName());
                }

                ItemResult r = new ItemResult();
                r.setItemId(String.valueOf(itemId != null ? itemId : 0L));
                r.setMedicineName(name);
                r.setRequestedQty(qty != null ? qty : 0);

                if (name.isBlank() || qty == null || qty <= 0) {
                    r.setDispensedQty(0);
                    r.setNote("Skipped: no name/qty");
                } else {
                    int disp = decrementStockByName(name, qty);
                    r.setDispensedQty(disp);
                    if (entityItem != null) {
                        entityItem.setRequiredQuantity(qty);
                        entityItem.setDispensedQuantity(disp);
                        entityItem.setDispensedStatus(disp > 0 ? 1 : 0);
                        prescriptionItemRepository.save(entityItem);
                    }
                    if (disp == qty) r.setNote("OK");
                    else if (disp == 0) r.setNote("Not in inventory / 0 stock");
                    else r.setNote("Partial (insufficient stock)");
                }

                results.add(r);
            }
        }

        // Generate invoice automatically after dispensing only for staff patients
        if (p.getPatient() != null && Role.Staff.equals(p.getPatient().getRole())) {
            try {
                invoiceService.generateInvoice(p.getId());
            } catch (Exception e) {
                // Log the error but don't fail the dispense operation
                System.err.println("Failed to generate invoice for prescription " + p.getId() + ": " + e.getMessage());
            }
        }

        // Do not mark as completed here; this is partial/manual dispense.
        prescriptionRepository.save(p);
        return DispenseSummary.builder()
                .prescriptionId(p.getId())
                .completed(false)
                .results(results)
                .build();
    }

    // -------------------- helpers --------------------

    private void validateCreateRequest(PrescriptionCreateRequest req) {
        if (req == null) throw new IllegalArgumentException("Request body is required.");
        if (req.getPatientId() == null || req.getPatientId().isBlank())
            throw new IllegalArgumentException("patientId is required.");
        if (req.getMedications() == null || req.getMedications().isEmpty())
            throw new IllegalArgumentException("medications list cannot be empty.");
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String nullToEmpty(String s) {
        return (s == null) ? "" : s;
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim();
    }

    /**
     * Heuristic to compute requested quantity when there's no explicit qty:
     * 1) If timesPerDay parses to an int, use that; else
     * 2) If timesPerDay looks like "1-0-1" or "1+1+1", sum digits; else
     * 3) Use number of timeOfDay entries.
     * Finally multiply by durationDays (parsed int, default 1). Minimum 1.
     */
    private int resolveRequestedQty(PrescriptionItem it) {
        // If your entity includes a quantity field later, prefer that directly.
        int perDay = 0;

        String tpd = safe(it.getTimesPerDay());
        if (!tpd.isBlank()) {
            try {
                perDay = Integer.parseInt(tpd);
            } catch (NumberFormatException ignored) {
                // patterns like "1-0-1" or "1+1+1"
                Matcher m = Pattern.compile("\\d").matcher(tpd);
                int sum = 0;
                while (m.find()) sum += Integer.parseInt(m.group());
                if (sum > 0) perDay = sum;
            }
        }

        if (perDay == 0) {
            List<TimeOfDay> tod = it.getTimeOfDay();
            if (tod != null && !tod.isEmpty()) perDay = tod.size();
        }

        int days = 1;
        String dur = safe(it.getDurationDays());
        if (!dur.isBlank()) {
            try { days = Math.max(1, Integer.parseInt(dur)); } catch (NumberFormatException ignored) {}
        }

        int qty = perDay * days;
        if (qty <= 0) qty = 1; // minimum safe fallback
        
        // Adjust quantity based on medicine strength
        qty = adjustQuantityForStrength(it, qty);
        
        return qty;
    }
    
    /**
     * Adjust the requested quantity based on medicine strength.
     * For example, if prescription requires 500mg but medicine is 250mg,
     * then we need 2 units per dose.
     */
    private int adjustQuantityForStrength(PrescriptionItem it, int baseQty) {
        String medicineName = safe(it.getMedicineName());
        if (medicineName.isBlank()) return baseQty;
        
        // Get the medicine from inventory that matches the prescription
        List<Medicine> candidates = medicineRepository.findByNameContainingIgnoreCase(medicineName);
        if (candidates == null || candidates.isEmpty()) return baseQty;
        
        // Select the best matching medicine
        Medicine medicine = selectBestMedicineMatch(candidates, medicineName);
        if (medicine == null || medicine.getStrength() == null) return baseQty;
        
        // Parse the dosage from the prescription item
        String prescribedDosage = safe(it.getDosage());
        if (prescribedDosage.isBlank()) return baseQty;
        
        // Extract strength values from both prescription and medicine
        Double prescribedStrength = extractStrengthValue(prescribedDosage);
        Double medicineStrength = extractStrengthValue(medicine.getStrength());
        
        // If we can't parse either strength, return base quantity
        if (prescribedStrength == null || medicineStrength == null || medicineStrength <= 0) {
            return baseQty;
        }
        
        // Calculate how many units of the medicine are needed per dose
        double unitsPerDose = prescribedStrength / medicineStrength;
        
        // Round up to ensure we have enough medicine
        int unitsPerDoseRounded = (int) Math.ceil(unitsPerDose);
        
        // Multiply by the base quantity to get the total units needed
        return baseQty * unitsPerDoseRounded;
    }
    
    /**
     * Extract the numeric strength value from a dosage string (e.g., "500mg" -> 500.0)
     */
    private Double extractStrengthValue(String dosage) {
        if (dosage == null || dosage.isBlank()) return null;
        
        // Use regex to extract the numeric part
        Pattern pattern = Pattern.compile("([0-9]+\\.?[0-9]*)");
        Matcher matcher = pattern.matcher(dosage);
        
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * Decrement stock for a medicine by (fuzzy) name match.
     * Improved to pick best match based on manufacturer/batch when available.
     */
    private int decrementStockByName(String name, int qty) {
        if (qty <= 0 || name.isBlank()) return 0;
        List<Medicine> list = medicineRepository.findByNameContainingIgnoreCase(name);
        if (list == null || list.isEmpty()) return 0;

        // Improved: Pick best match based on manufacturer and batch availability
        Medicine med = selectBestMedicineMatch(list, name);
        int before = med.getStock();
        int dispensed = Math.min(before, qty);
        med.setStock(before - dispensed);
        med.setLastUpdate(LocalDate.now());
        medicineRepository.save(med);
        return dispensed;
    }

    /**
     * Select the best medicine match from a list of candidates.
     * Prioritizes medicines with manufacturer/batch information for better accuracy.
     */
    private Medicine selectBestMedicineMatch(List<Medicine> candidates, String searchName) {
        if (candidates.size() == 1) {
            return candidates.get(0);
        }

        // First, try to find exact name matches
        for (Medicine med : candidates) {
            if (med.getName() != null && med.getName().equalsIgnoreCase(searchName.trim())) {
                return med;
            }
        }

        // Then prioritize medicines with manufacturer info (more specific)
        for (Medicine med : candidates) {
            if (med.getManufacturer() != null && !med.getManufacturer().isBlank()) {
                return med;
            }
        }

        // Finally, prioritize medicines with higher stock (more available)
        Medicine best = candidates.get(0);
        for (Medicine med : candidates) {
            if (med.getStock() > best.getStock()) {
                best = med;
            }
        }

        return best;
    }

    /**
     * Mark a prescription as completed (isActive = false) without dispensing logic.
     * Used after manual dispense to explicitly complete the record.
     */
    @Transactional
    public void markComplete(String prescriptionId) {
        Prescription p = getByIdOrThrow(prescriptionId);
        p.setIsActive(false);
        prescriptionRepository.save(p);
    }

    /**
     * Get completed prescriptions for a specific patient (active=false, newest first).
     * Use this for the patient dashboard.
     */
    @Transactional(readOnly = true)
    public List<Prescription> getCompletedPrescriptionsForPatient(String patientId) {
        System.out.println("DEBUG: Looking for completed prescriptions for patientId: " + patientId);

        // First try to find by User entity relationship (most reliable)
        User patient = userRepository.findById(patientId).orElse(null);
        if (patient != null) {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientAndIsActiveOrderByPrescriptionDateDesc(patient, false);
            System.out.println("DEBUG: Found " + prescriptions.size() + " completed prescriptions by User entity");
            if (!prescriptions.isEmpty()) {
                for (Prescription p : prescriptions) {
                    System.out.println("DEBUG: Prescription ID: " + p.getId() + ", Patient ID: " + p.getPatientId() + ", IsActive: " + p.getIsActive());
                }
                return prescriptions;
            }
        }

        // Fallback: try to find by encrypted patient ID string
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdAndIsActiveOrderByPrescriptionDateDesc(patientId, false);
        System.out.println("DEBUG: Found " + prescriptions.size() + " completed prescriptions by encrypted patientId");

        System.out.println("DEBUG: Total found " + prescriptions.size() + " completed prescriptions");
        for (Prescription p : prescriptions) {
            System.out.println("DEBUG: Prescription ID: " + p.getId() + ", Patient ID: " + p.getPatientId() + ", IsActive: " + p.getIsActive());
        }
        return prescriptions;
    }

    /**
     * Get all prescriptions for a specific patient (newest first).
     * Use this for the doctor to see all prescriptions they've issued to a patient.
     */
    @Transactional(readOnly = true)
    public List<Prescription> getAllPrescriptionsForPatient(String patientId) {
        System.out.println("DEBUG: Looking for all prescriptions for patientId: " + patientId);

        // First try to find by User entity relationship (most reliable)
        User patient = userRepository.findById(patientId).orElse(null);
        if (patient != null) {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientOrderByPrescriptionDateDesc(patient);
            System.out.println("DEBUG: Found " + prescriptions.size() + " prescriptions by User entity");
            if (!prescriptions.isEmpty()) {
                return prescriptions;
            }
        }

        // Fallback: try to find by encrypted patient ID string
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId);
        System.out.println("DEBUG: Found " + prescriptions.size() + " prescriptions by encrypted patientId");

        return prescriptions;
    }

    // ----------- lightweight DTOs (kept here for convenience) ------------

    @Data @Builder @AllArgsConstructor
    public static class QueueRow {
        private String id;
        private String patientId;
        private String patientName;
        private String doctorName;
        private int itemCount;
        private Date createdAt;
    }

    @Data @Builder @AllArgsConstructor
    public static class DispenseSummary {
        private String prescriptionId;
        private boolean completed;
        private List<ItemResult> results;
    }

    @Data @AllArgsConstructor @Builder
    public static class ItemResult {
        private String itemId;
        private String medicineName;
        private Integer requestedQty;
        private Integer dispensedQty;
        private String note;
        public ItemResult() {}
    }
}
