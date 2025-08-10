package com.mis.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDTO {
    private Long id;
    private String generic;
    private String name;
    private String form;
    private String strength;
    private int stock;
    private String batch;
    private String mfg;
    private String expiry;
    private String manufacturer;
    private String category;
    private Float unitPrice;
    private LocalDate lastUpdate;

}
