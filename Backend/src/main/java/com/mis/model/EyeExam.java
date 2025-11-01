package com.mis.model;

import com.mis.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "eye_exams")
public class EyeExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "medical_record_id", referencedColumnName = "id")
    private MedicalRecord medicalRecord;

    @Convert(converter = EncryptedStringConverter.class)
    private String visionWithoutGlassesRight;
    @Convert(converter = EncryptedStringConverter.class)
    private String visionWithoutGlassesLeft;
    @Convert(converter = EncryptedStringConverter.class)
    private String visionWithGlassesRight;
    @Convert(converter = EncryptedStringConverter.class)
    private String visionWithGlassesLeft;
    @Convert(converter = EncryptedStringConverter.class)
    private String colorVision;
}