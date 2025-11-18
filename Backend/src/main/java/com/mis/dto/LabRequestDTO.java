package com.mis.dto;

import java.time.LocalDateTime;

public class LabRequestDTO {
    private String id;
    private String patientName;
    private String testType;
    private LocalDateTime orderDate;
    private String status;

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
