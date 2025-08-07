package com.mis.dto;

import lombok.*;

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
}
