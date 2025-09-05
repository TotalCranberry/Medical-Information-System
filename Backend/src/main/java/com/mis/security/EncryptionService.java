package com.mis.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class EncryptionService {

    @Value("${app.crypto.secret}")
    private String secretBase64; // 32 bytes (256-bit) base64

    private SecretKey key;
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_BYTES = 12;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        byte[] raw = Base64.getDecoder().decode(secretBase64);
        if (raw.length != 32) {
            throw new IllegalStateException("app.crypto.secret must be 32 bytes (Base64-encoded).");
        }
        this.key = new SecretKeySpec(raw, "AES");
    }

    public String encrypt(String plaintext) {
        if (plaintext == null) return null;
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] ct = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(ct, 0, out, iv.length, ct.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String ciphertextB64) {
        if (ciphertextB64 == null) return null;

        // Check if data looks like it might already be unencrypted
        if (!isBase64Encoded(ciphertextB64)) {
            System.err.println("Data does not appear to be Base64 encoded, returning as-is: " + ciphertextB64);
            return ciphertextB64;
        }

        try {
            byte[] in = Base64.getDecoder().decode(ciphertextB64);

            // Validate minimum length (IV + at least 1 byte of encrypted data + GCM tag)
            if (in.length < IV_BYTES + 1 + GCM_TAG_BITS/8) {
                System.err.println("Encrypted data too short, returning as-is: " + ciphertextB64);
                return ciphertextB64;
            }

            byte[] iv = java.util.Arrays.copyOfRange(in, 0, IV_BYTES);
            byte[] ct = java.util.Arrays.copyOfRange(in, IV_BYTES, in.length);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] pt = cipher.doFinal(ct);
            return new String(pt, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            // If decryption fails, return the original data (might be unencrypted or encrypted with different key)
            // This allows the application to continue working with existing data
            System.err.println("Decryption failed for data: " + ciphertextB64 + ". Returning as-is. Error: " + e.getMessage());
            return ciphertextB64;
        }
    }

    /**
     * Check if a string appears to be Base64 encoded
     */
    private boolean isBase64Encoded(String data) {
        if (data == null || data.length() == 0) return false;

        // Base64 strings should have length divisible by 4 (after padding)
        if (data.length() % 4 != 0) return false;

        // Try to decode to check if it's valid Base64
        try {
            Base64.getDecoder().decode(data);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
