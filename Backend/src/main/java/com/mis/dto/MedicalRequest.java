package com.mis.dto;

import jakarta.validation.constraints.NotBlank;

public class MedicalRequest {

    @NotBlank(message = "Recommendations cannot be blank")
    private String recommendations;

    private String additionalNotes;
    
    private String appointmentId; // Optional - to link medical to specific appointment

    // Constructors
    public MedicalRequest() {}

    public MedicalRequest(String recommendations, String additionalNotes, String appointmentId) {
        this.recommendations = recommendations;
        this.additionalNotes = additionalNotes;
        this.appointmentId = appointmentId;
    }

    // Getters and Setters
    public String getRecommendations() { 
        return recommendations; 
    }
    
    public void setRecommendations(String recommendations) { 
        this.recommendations = recommendations; 
    }

    public String getAdditionalNotes() { 
        return additionalNotes; 
    }
    
    public void setAdditionalNotes(String additionalNotes) { 
        this.additionalNotes = additionalNotes; 
    }

    public String getAppointmentId() { 
        return appointmentId; 
    }
    
    public void setAppointmentId(String appointmentId) { 
        this.appointmentId = appointmentId; 
    }
}