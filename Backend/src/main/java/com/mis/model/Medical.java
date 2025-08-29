package com.mis.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "medicals")
public class Medical {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_email", nullable = false)
    private String patientEmail;

    @Column(name = "patient_faculty")
    private String patientFaculty;

    @Column(name = "patient_role", nullable = false)
    private String patientRole;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String recommendations;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "medical_date", nullable = false)
    private Date medicalDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @Column(name = "is_sent_to_course_unit", nullable = false)
    private Boolean isSentToCourseUnit = false;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "sent_to_course_unit_at")
    private Date sentToCourseUnitAt;

    // Constructors
    public Medical() {
        this.createdAt = new Date();
        this.isSentToCourseUnit = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientFaculty() { return patientFaculty; }
    public void setPatientFaculty(String patientFaculty) { this.patientFaculty = patientFaculty; }

    public String getPatientRole() { return patientRole; }
    public void setPatientRole(String patientRole) { this.patientRole = patientRole; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public Date getMedicalDate() { return medicalDate; }
    public void setMedicalDate(Date medicalDate) { this.medicalDate = medicalDate; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Boolean getIsSentToCourseUnit() { return isSentToCourseUnit; }
    public void setIsSentToCourseUnit(Boolean isSentToCourseUnit) { this.isSentToCourseUnit = isSentToCourseUnit; }

    public Date getSentToCourseUnitAt() { return sentToCourseUnitAt; }
    public void setSentToCourseUnitAt(Date sentToCourseUnitAt) { this.sentToCourseUnitAt = sentToCourseUnitAt; }
}