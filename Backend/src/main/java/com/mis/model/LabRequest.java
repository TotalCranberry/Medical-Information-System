package com.mis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LabRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    private User patient;

    // Track status as STRING to avoid MySQL ENUM issues
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(255)")
    private Status status;

    private String testType;
    private LocalDateTime orderDate;

    // ✅ Updated enum with IN_PROGRESS
    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        DECLINED
    }

    // ✅ Getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
}
