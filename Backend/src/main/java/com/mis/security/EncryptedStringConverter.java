package com.mis.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static EncryptionService delegate;

    @Autowired
    public void setEncryptionService(EncryptionService svc) {
        // static delegate so JPA converter can use Spring bean
        EncryptedStringConverter.delegate = svc;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return (delegate == null || attribute == null) ? attribute : delegate.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return (delegate == null || dbData == null) ? dbData : delegate.decrypt(dbData);
    }
}
