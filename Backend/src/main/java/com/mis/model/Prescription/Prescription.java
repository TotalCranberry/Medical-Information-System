package com.mis.model.Prescription;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mis.model.User;
import com.mis.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(
    name = "prescriptions",
    indexes = {
        @Index(name = "idx_presc_patient_id", columnList = "patient_id"),
        @Index(name = "idx_presc_encrypted_patient_id", columnList = "encrypted_patient_id"),
        @Index(name = "idx_presc_doctor_id", columnList = "doctor_id"),
        @Index(name = "idx_presc_appointment_id", columnList = "appointment_id"),
        @Index(name = "idx_presc_date", columnList = "prescription_date")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"items"})
public class Prescription {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id; // UUID generated in service layer

    // ---------- Patient linkage ----------
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id")
    private User patient;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "encrypted_patient_id", length = 512, nullable = false) // widened for encrypted value
    private String patientId;  // encrypted string copy of patient id

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "patient_name", length = 512) // widened for encrypted value
    private String patientName; // encrypted patient display name

    // ---------- Doctor attribution ----------
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "doctor_id", length = 512, nullable = false) // widened for encrypted value
    private String doctorId; // encrypted doctor id (derived from auth principal)

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "doctor_name", length = 512) // widened for encrypted value
    private String doctorName; // encrypted doctor display name

    // ---------- Visit linkage ----------
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "appointment_id", length = 512) // widened for encrypted value
    private String appointmentId; // encrypted appointment id (optional)

    // ---------- Content ----------
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // general notes (encrypted)

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "prescription_date", nullable = false)
    private Date prescriptionDate; // when the prescription was issued

    // ---------- Status ----------
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = Boolean.TRUE;

    // ---------- Items ----------
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PrescriptionItem> items = new ArrayList<>();

    // ---------- Audit ----------
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        Date now = new Date();
        this.createdAt = now;
        if (this.prescriptionDate == null) {
            this.prescriptionDate = now;
        }
        if (this.isActive == null) this.isActive = Boolean.TRUE;
        if (this.items != null) {
            for (PrescriptionItem it : this.items) {
                it.setPrescription(this);
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    // Convenience helpers
    public void addItem(PrescriptionItem item) {
        if (items == null) items = new ArrayList<>();
        item.setPrescription(this);
        items.add(item);
    }

    public void removeItem(PrescriptionItem item) {
        if (items != null) {
            items.remove(item);
            item.setPrescription(null);
        }
    }
}
