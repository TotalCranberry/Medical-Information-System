package com.mis.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Autowired
    private EncryptionService encryptionService;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            return encryptionService.encrypt(attribute);
        } catch (Exception e) {
            System.err.println("Encryption failed for attribute: " + attribute + ". Error: " + e.getMessage());
            // Return original value if encryption fails to prevent data loss
            return attribute;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return encryptionService.decrypt(dbData);
        } catch (Exception e) {
            // If decryption fails, return the original encrypted data
            // This allows the application to continue functioning
            System.err.println("Decryption failed for data: " + dbData + ". Returning as-is. Error: " + e.getMessage());
            return dbData;
        }
    }
}
