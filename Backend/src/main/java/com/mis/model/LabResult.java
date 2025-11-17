package com.mis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Link to LabRequest, which contains the patient info
    @ManyToOne
    @JoinColumn(name = "lab_request_id")
    private LabRequest labRequest;

    private String fileName;
    private String fileUrl;

    // Timestamp for ordering
    private LocalDateTime uploadedAt;

    // --------------------------
    // Getters and Setters
    // --------------------------
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LabRequest getLabRequest() {
        return labRequest;
    }

    public void setLabRequest(LabRequest labRequest) {
        this.labRequest = labRequest;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    // --------------------------
    // Derived properties for repository queries
    // --------------------------

    // This allows findByPatientOrderByCreatedAtDesc to work
    @Transient
    public User getPatient() {
        return labRequest != null ? labRequest.getPatient() : null;
    }

    // For ordering by createdAt
    @Transient
    public LocalDateTime getCreatedAt() {
        return uploadedAt;
    }
}
