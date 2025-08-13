package com.mis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 64)
    private String patientId;

    @Column(name = "doctor_id", nullable = false, length = 64)
    private String doctorId;

    @Column(name = "appointment_id", length = 64)
    private String appointmentId;

    @Column(name = "patient_name", nullable = false, length = 120)
    private String patientName;


    @Column(name = "doctor_name", nullable = false, length = 120)
    private String doctorName;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;
  

    @OneToMany(
            mappedBy = "prescription",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<PrescriptionMedication> medications = new ArrayList<>();

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @Column(name = "encrypted_data", columnDefinition = "TEXT")
    private String encryptedData;

    @Column(name = "verification_hash", length = 255)
    private String verificationHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PrescriptionStatus status = PrescriptionStatus.REQUESTED;

    @CreationTimestamp
    @Column(name = "request_date", nullable = false, updatable = false)
    private LocalDateTime requestDate;

    @PrePersist
    protected void onCreate() {
        if (requestDate == null) requestDate = LocalDateTime.now();
    }

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "pharmacist_id", length = 64)
    private String pharmacistId;

    @Column(name = "pharmacist_name", length = 120)
    private String pharmacistName;

    @Column(name = "pharmacy_notes", columnDefinition = "TEXT")
    private String pharmacyNotes;

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }


    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;


    public void addMedication(PrescriptionMedication med) {
        if (med != null) {
            med.setPrescription(this);
            this.medications.add(med);
        }
    }

    public void removeMedication(PrescriptionMedication med) {
        if (med != null) {
            med.setPrescription(null);
            this.medications.remove(med);
        }
    }


    public enum PrescriptionStatus {
        REQUESTED("Requested"),
        PENDING("Pending"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        REJECTED("Rejected");

        private final String displayName;

        PrescriptionStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
