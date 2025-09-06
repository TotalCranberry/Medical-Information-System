package com.mis.service.Prescription;

import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;
import com.mis.repository.Prescription.PrescriptionRepository;
import com.mis.security.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionMigrationService {

    private final PrescriptionRepository prescriptionRepository;
    private final EncryptionService encryptionService;

    /**
     * Migrate existing prescription data that may have been encrypted with different keys.
     * This method attempts to re-encrypt data that fails decryption with the current key.
     */
    @Transactional
    public void migratePrescriptionData() {
        log.info("Starting prescription data migration...");

        List<Prescription> prescriptions = prescriptionRepository.findAll();
        int migratedCount = 0;
        int errorCount = 0;

        for (Prescription prescription : prescriptions) {
            try {
                boolean prescriptionMigrated = migratePrescription(prescription);
                if (prescriptionMigrated) {
                    migratedCount++;
                }

                // Also migrate prescription items
                if (prescription.getItems() != null) {
                    for (PrescriptionItem item : prescription.getItems()) {
                        boolean itemMigrated = migratePrescriptionItem(item);
                        if (itemMigrated) {
                            migratedCount++;
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error migrating prescription {}: {}", prescription.getId(), e.getMessage());
                errorCount++;
            }
        }

        log.info("Migration completed. Migrated: {}, Errors: {}", migratedCount, errorCount);
    }

    /**
     * Attempt to migrate a single prescription by re-encrypting its fields.
     */
    private boolean migratePrescription(Prescription prescription) {
        boolean migrated = false;

        try {
            // Try to decrypt each field - if it fails, the data might be unencrypted or encrypted with different key
            String patientId = prescription.getPatientId();
            if (patientId != null && !isLikelyDecrypted(patientId)) {
                // If decryption fails, the field might contain unencrypted data that needs to be encrypted
                String reEncrypted = encryptionService.encrypt(patientId);
                prescription.setPatientId(reEncrypted);
                migrated = true;
            }

            String patientName = prescription.getPatientName();
            if (patientName != null && !isLikelyDecrypted(patientName)) {
                String reEncrypted = encryptionService.encrypt(patientName);
                prescription.setPatientName(reEncrypted);
                migrated = true;
            }

            String doctorId = prescription.getDoctorId();
            if (doctorId != null && !isLikelyDecrypted(doctorId)) {
                String reEncrypted = encryptionService.encrypt(doctorId);
                prescription.setDoctorId(reEncrypted);
                migrated = true;
            }

            String doctorName = prescription.getDoctorName();
            if (doctorName != null && !isLikelyDecrypted(doctorName)) {
                String reEncrypted = encryptionService.encrypt(doctorName);
                prescription.setDoctorName(reEncrypted);
                migrated = true;
            }

            String appointmentId = prescription.getAppointmentId();
            if (appointmentId != null && !isLikelyDecrypted(appointmentId)) {
                String reEncrypted = encryptionService.encrypt(appointmentId);
                prescription.setAppointmentId(reEncrypted);
                migrated = true;
            }

            String notes = prescription.getNotes();
            if (notes != null && !isLikelyDecrypted(notes)) {
                String reEncrypted = encryptionService.encrypt(notes);
                prescription.setNotes(reEncrypted);
                migrated = true;
            }

            if (migrated) {
                prescriptionRepository.save(prescription);
                log.debug("Migrated prescription: {}", prescription.getId());
            }

        } catch (Exception e) {
            log.warn("Failed to migrate prescription {}: {}", prescription.getId(), e.getMessage());
        }

        return migrated;
    }

    /**
     * Attempt to migrate a single prescription item by re-encrypting its fields.
     */
    private boolean migratePrescriptionItem(PrescriptionItem item) {
        boolean migrated = false;

        try {
            String medicineName = item.getMedicineName();
            if (medicineName != null && !isLikelyDecrypted(medicineName)) {
                String reEncrypted = encryptionService.encrypt(medicineName);
                item.setMedicineName(reEncrypted);
                migrated = true;
            }

            String dosage = item.getDosage();
            if (dosage != null && !isLikelyDecrypted(dosage)) {
                String reEncrypted = encryptionService.encrypt(dosage);
                item.setDosage(reEncrypted);
                migrated = true;
            }

            String timesPerDay = item.getTimesPerDay();
            if (timesPerDay != null && !isLikelyDecrypted(timesPerDay)) {
                String reEncrypted = encryptionService.encrypt(timesPerDay);
                item.setTimesPerDay(reEncrypted);
                migrated = true;
            }

            String durationDays = item.getDurationDays();
            if (durationDays != null && !isLikelyDecrypted(durationDays)) {
                String reEncrypted = encryptionService.encrypt(durationDays);
                item.setDurationDays(reEncrypted);
                migrated = true;
            }

            String instructions = item.getInstructions();
            if (instructions != null && !isLikelyDecrypted(instructions)) {
                String reEncrypted = encryptionService.encrypt(instructions);
                item.setInstructions(reEncrypted);
                migrated = true;
            }

        } catch (Exception e) {
            log.warn("Failed to migrate prescription item {}: {}", item.getId(), e.getMessage());
        }

        return migrated;
    }

    /**
     * Check if a string is likely already decrypted (not Base64 encoded).
     * This is a heuristic to avoid re-encrypting already decrypted data.
     */
    private boolean isLikelyDecrypted(String data) {
        if (data == null || data.length() == 0) {
            return true;
        }

        // If it looks like Base64 and decryption succeeds, it's likely already encrypted
        if (isBase64Encoded(data)) {
            try {
                encryptionService.decrypt(data);
                return false; // Successfully decrypted, so it was encrypted
            } catch (Exception e) {
                // Decryption failed, so it might be unencrypted data that looks like Base64
                return true;
            }
        }

        // If it doesn't look like Base64, it's likely unencrypted
        return true;
    }

    /**
     * Check if a string appears to be Base64 encoded.
     */
    private boolean isBase64Encoded(String data) {
        if (data == null || data.length() == 0) return false;

        // Base64 strings should have length divisible by 4 (after padding)
        if (data.length() % 4 != 0) return false;

        // Try to decode to check if it's valid Base64
        try {
            java.util.Base64.getDecoder().decode(data);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}