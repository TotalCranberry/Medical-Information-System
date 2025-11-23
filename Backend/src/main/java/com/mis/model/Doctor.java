package com.mis.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    private String id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String availability; // JSON string

    @Column(name = "doctor_signature", columnDefinition = "LONGBLOB")
    private byte[] doctorSignature;

    @Column(name = "doctor_signature_content_type")
    private String doctorSignatureContentType;

    @Column(name = "doctor_seal", columnDefinition = "LONGBLOB")
    private byte[] doctorSeal;

    @Column(name = "doctor_seal_content_type")
    private String doctorSealContentType;

    // getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public byte[] getDoctorSignature() {
        return doctorSignature;
    }

    public void setDoctorSignature(byte[] doctorSignature) {
        this.doctorSignature = doctorSignature;
    }

    public String getDoctorSignatureContentType() {
        return doctorSignatureContentType;
    }

    public void setDoctorSignatureContentType(String doctorSignatureContentType) {
        this.doctorSignatureContentType = doctorSignatureContentType;
    }

    public byte[] getDoctorSeal() {
        return doctorSeal;
    }

    public void setDoctorSeal(byte[] doctorSeal) {
        this.doctorSeal = doctorSeal;
    }

    public String getDoctorSealContentType() {
        return doctorSealContentType;
    }

    public void setDoctorSealContentType(String doctorSealContentType) {
        this.doctorSealContentType = doctorSealContentType;
    }

}
