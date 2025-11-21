package com.mis.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(min = 2, message = "Name must be at least 2 characters long")
    private String name;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String hostel;
    private String roomNumber;
    private String phoneNumber;
    
    public ProfileUpdateRequest() {}
    
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getHostel() {
        return hostel;
    }

    public void setHostel(String hostel) {
        this.hostel = hostel;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

}
