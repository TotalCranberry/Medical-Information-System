package com.mis.dto;

import jakarta.validation.constraints.NotBlank;

public class DiagnosisRequest {

    @NotBlank(message = "Diagnosis cannot be blank")
    private String diagnosis;

    private String notes;
    
    private String appointmentId; // Optional - to link diagnosis to specific appointment

    // Getters and Setters
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
}