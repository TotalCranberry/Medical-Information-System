package com.mis.model.Medicine;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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
    private String mfg;
    private String expiry;
    private String manufacturer;
    private String category;
    private Float unitPrice;
    private LocalDate lastUpdate;

    @Column(name = "low_stock_quantity")
    private Integer lowStockQuantity;

}

