package com.mis.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(min = 2, message = "Name must be at least 2 characters long")
    private String name;
    
    private LocalDate dateOfBirth;
    
    // Constructors
    public ProfileUpdateRequest() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

}
