package com.mis.model;

import com.mis.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "physical_exams")
public class PhysicalExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "medical_record_id", referencedColumnName = "id")
    private MedicalRecord medicalRecord;

    @Convert(converter = EncryptedStringConverter.class)
    private String weightKg;
    @Convert(converter = EncryptedStringConverter.class)
    private String heightCm;
    @Convert(converter = EncryptedStringConverter.class)
    private String bmi;
    @Convert(converter = EncryptedStringConverter.class)
    private String vaccinationStatus;
}