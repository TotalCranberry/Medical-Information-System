package com.mis.model;

import com.mis.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Convert(converter = EncryptedStringConverter.class)
    private String pastHospitalAdmissions;
    @Convert(converter = EncryptedStringConverter.class)
    private String chronicIllnesses;
    @Convert(converter = EncryptedStringConverter.class)
    private String physicalDisabilities;
    @Convert(converter = EncryptedStringConverter.class)
    private String allergies;
    @Convert(converter = EncryptedStringConverter.class)
    private String emergencyContactName;
    @Convert(converter = EncryptedStringConverter.class)
    private String emergencyContactAddress;
    @Convert(converter = EncryptedStringConverter.class)
    private String emergencyContactPhone;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EyeExam eyeExam;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DentalExam dentalExam;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PhysicalExam physicalExam;
}