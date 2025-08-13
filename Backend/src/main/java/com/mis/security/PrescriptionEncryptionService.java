package com.mis.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mis.model.PrescriptionMedication;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PrescriptionEncryptionService {

    private final ObjectMapper objectMapper;
    private final String secretKey;
    private final SecureRandom secureRandom;

    public PrescriptionEncryptionService(
            ObjectMapper objectMapper,
            @Value("${app.prescription.encryption.secret-key:default-secret-key-change-in-production}")
            String secretKey
    ) {
        this.objectMapper = objectMapper;
        this.secretKey = secretKey;
        this.secureRandom = new SecureRandom();
    }

    /* =========================================================================================
       Medications encryption (AES-GCM) + verification
       ========================================================================================= */

    /** Create a canonical JSON (no back-refs) of the medications list. */
    private String medsToCanonicalJson(List<PrescriptionMedication> meds) {
        try {
            List<Map<String, Object>> payload = meds.stream().map(m -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("medicineId", m.getMedicineId());
                row.put("medicineName", m.getMedicineName());
                row.put("dosage", m.getDosage());
                row.put("durationDays", m.getDurationDays());
                row.put("morningDose", m.getMorningDose());
                row.put("afternoonDose", m.getAfternoonDose());
                row.put("eveningDose", m.getEveningDose());
                row.put("nightDose", m.getNightDose());
                row.put("mealTiming", m.getMealTiming());
                row.put("administrationMethod", m.getAdministrationMethod());
                row.put("remarks", m.getRemarks());
                row.put("quantityDispensed", m.getQuantityDispensed());
                row.put("unitPrice", m.getUnitPrice());
                row.put("totalPrice", m.getTotalPrice());
                row.put("isDispensed", m.getIsDispensed());
                return row;
            }).toList();

            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize medications", e);
        }
    }

    /** Canonical JSON for a single medication row. */
    private String medToCanonicalJson(PrescriptionMedication m) {
        try {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("medicineId", m.getMedicineId());
            row.put("medicineName", m.getMedicineName());
            row.put("dosage", m.getDosage());
            row.put("durationDays", m.getDurationDays());
            row.put("morningDose", m.getMorningDose());
            row.put("afternoonDose", m.getAfternoonDose());
            row.put("eveningDose", m.getEveningDose());
            row.put("nightDose", m.getNightDose());
            row.put("mealTiming", m.getMealTiming());
            row.put("administrationMethod", m.getAdministrationMethod());
            row.put("remarks", m.getRemarks());
            row.put("quantityDispensed", m.getQuantityDispensed());
            row.put("unitPrice", m.getUnitPrice());
            row.put("totalPrice", m.getTotalPrice());
            row.put("isDispensed", m.getIsDispensed());
            return objectMapper.writeValueAsString(row);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize medication", e);
        }
    }

    /** Derive a 256-bit AES key from the configured secret using SHA-256. */
    private SecretKeySpec aesKey() {
        try {
            byte[] k = MessageDigest.getInstance("SHA-256")
                    .digest(secretKey.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(k, "AES");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /** AES-GCM encrypts JSON -> returns "iv.ciphertext" (URL-safe Base64). */
    private String encryptJson(String json) {
        try {
            byte[] iv = new byte[12];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, aesKey(), new GCMParameterSpec(128, iv));
            byte[] ct = cipher.doFinal(json.getBytes(StandardCharsets.UTF_8));

            String ivB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(iv);
            String ctB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(ct);
            return ivB64 + "." + ctB64;
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /** AES-GCM decrypts "iv.ciphertext" back to JSON. */
    private String decryptToJson(String token) {
        try {
            String[] parts = token.split("\\.", 2);
            byte[] iv = Base64.getUrlDecoder().decode(parts[0]);
            byte[] ct = Base64.getUrlDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, aesKey(), new GCMParameterSpec(128, iv));
            byte[] pt = cipher.doFinal(ct);
            return new String(pt, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /** Simple verification hash (binds JSON to secret). */
    private String verificationHash(String json) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256")
                    .digest((json + secretKey).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(h);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Public API: encrypt the medications list and return ciphertext + verification hash. */
    public EncryptedPrescriptionData encryptMedications(List<PrescriptionMedication> meds) {
        String json = medsToCanonicalJson(meds);
        String token = encryptJson(json);
        String vhash = verificationHash(json);
        return new EncryptedPrescriptionData(token, vhash, null);
    }

    /** Public API: encrypt a single medication row and return ciphertext + verification hash. */
    public EncryptedPrescriptionData encryptMedication(PrescriptionMedication m) {
        String json = medToCanonicalJson(m);
        String token = encryptJson(json);
        String vhash = verificationHash(json);
        return new EncryptedPrescriptionData(token, vhash, null);
    }

    /** Verify the encrypted medications snapshot against the stored verification hash. */
    public boolean verifyMedications(String encryptedData, String expectedHash) {
        String json = decryptToJson(encryptedData);
        return verificationHash(json).equals(expectedHash);
    }

    /** Verify a single medication snapshot. */
    public boolean verifyMedication(String encryptedData, String expectedHash) {
        String json = decryptToJson(encryptedData);
        return verificationHash(json).equals(expectedHash);
    }

    /** Optional: decrypt back into a list of maps (or create a DTO if needed). */
    public List<Map<String, Object>> decryptMedications(String encryptedData) {
        try {
            String json = decryptToJson(encryptedData);
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse decrypted medications JSON", e);
        }
    }

    /** Optional: decrypt a single medication snapshot back into a map. */
    public Map<String, Object> decryptMedication(String encryptedData) {
        try {
            String json = decryptToJson(encryptedData);
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse decrypted medication JSON", e);
        }
    }

    /* =========================================================================================
       BACKWARD COMPATIBILITY: your previous double-hash functions (one-way hashing)
       ========================================================================================= */

    /** One-way “double hash” (kept for compatibility with existing code). */
    public EncryptedPrescriptionData doubleHashPrescriptionData(Object prescriptionData) {
        try {
            String jsonData = objectMapper.writeValueAsString(prescriptionData);

            byte[] salt = new byte[16];
            secureRandom.nextBytes(salt);
            String saltString = Base64.getEncoder().encodeToString(salt);

            String firstHash = hashWithSalt(jsonData, saltString);
            String secondHash = hashWithSecret(firstHash, secretKey);
            String vhash = createVerificationHash(jsonData, saltString);

            return new EncryptedPrescriptionData(secondHash, vhash, saltString);
        } catch (Exception e) {
            log.error("Error double hashing prescription data", e);
            throw new RuntimeException("Failed to encrypt prescription data", e);
        }
    }

    public boolean verifyPrescriptionData(String originalData, String verificationHash, String salt) {
        try {
            String expected = createVerificationHash(originalData, salt);
            return expected.equals(verificationHash);
        } catch (Exception e) {
            log.error("Error verifying prescription data", e);
            return false;
        }
    }

    /** IDs are Strings now (UUIDs). */
    public String createAuditHash(String prescriptionId, String patientId, String doctorId) {
        try {
            String data = String.format("prescription:%s:patient:%s:doctor:%s",
                    prescriptionId, patientId, doctorId);
            return hashWithSecret(data, secretKey);
        } catch (Exception e) {
            log.error("Error creating audit hash", e);
            throw new RuntimeException("Failed to create audit hash", e);
        }
    }

    /* ===== helpers for legacy hashing ===== */

    private String hashWithSalt(String data, String salt) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest((data + salt).getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hashBytes);
    }

    private String hashWithSecret(String data, String secret) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest((data + secret).getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hashBytes);
    }

    private String createVerificationHash(String originalData, String salt) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest((originalData + salt + secretKey).getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hashBytes);
    }

    /* =========================================================================================
       Return type
       ========================================================================================= */
    public static class EncryptedPrescriptionData {
        private final String encryptedData;
        private final String verificationHash;
        private final String salt;

        public EncryptedPrescriptionData(String encryptedData, String verificationHash, String salt) {
            this.encryptedData = encryptedData;
            this.verificationHash = verificationHash;
            this.salt = salt;
        }
        public String getEncryptedData() { return encryptedData; }
        public String getVerificationHash() { return verificationHash; }
        public String getSalt() { return salt; }
    }
}
