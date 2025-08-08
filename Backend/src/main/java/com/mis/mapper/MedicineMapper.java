package com.mis.mapper;

import com.mis.dto.MedicineDTO;
import com.mis.model.Medicine;

public class MedicineMapper {

    public static MedicineDTO toDto(Medicine med) {
        if (med == null) return null;

        return MedicineDTO.builder()
                .id(med.getId())
                .generic(med.getGeneric())
                .name(med.getName())
                .form(med.getForm())
                .strength(med.getStrength())
                .stock(med.getStock())
                .batch(med.getBatch())
                .mfg(med.getMfg())
                .expiry(med.getExpiry())
                .manufacturer(med.getManufacturer())
                .category(med.getCategory())
                .unitPrice(med.getUnitPrice())
                .lastUpdate(med.getLastUpdate())
                .build();
    }

    public static Medicine toEntity(MedicineDTO dto) {
        if (dto == null) return null;

        return Medicine.builder()
                .id(dto.getId())
                .generic(dto.getGeneric())
                .name(dto.getName())
                .form(dto.getForm())
                .strength(dto.getStrength())
                .stock(dto.getStock())
                .batch(dto.getBatch())
                .mfg(dto.getMfg())
                .expiry(dto.getExpiry())
                .manufacturer(dto.getManufacturer())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .lastUpdate(dto.getLastUpdate())
                .build();
    }
}
