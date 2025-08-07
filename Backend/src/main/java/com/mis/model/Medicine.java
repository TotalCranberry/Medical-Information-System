package com.mis.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

