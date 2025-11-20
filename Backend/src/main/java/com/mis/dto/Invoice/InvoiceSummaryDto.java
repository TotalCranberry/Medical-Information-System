package com.mis.dto.Invoice;

import java.time.LocalDateTime;

public class InvoiceSummaryDto {
    private Long id;
    private LocalDateTime createdAt;
    private String patientName;

    public InvoiceSummaryDto() {}

    public InvoiceSummaryDto(Long id, LocalDateTime createdAt, String patientName) {
        this.id = id;
        this.createdAt = createdAt;
        this.patientName = patientName;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
}