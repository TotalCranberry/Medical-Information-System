package com.mis.dto;

import java.time.LocalDate;

import com.mis.model.AuthMethod;
import com.mis.model.Role;

public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private AuthMethod authMethod;
    private LocalDate dateOfBirth; 
    private String faculty; 
    private String registrationNumber;
    private Integer age; 
    private String gender;
    private boolean medicalRecord;
    private String hostel;
    private String roomNumber;
    private String phoneNumber;

    // Getters and Setters...
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public AuthMethod getAuthMethod() { return authMethod; }
    public void setAuthMethod(AuthMethod authMethod) { this.authMethod = authMethod; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public Integer getAge() { return age; } 
    public void setAge(Integer age) { this.age = age; } 
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public boolean getMedicalRecord() { return medicalRecord; }
    public void setMedicalRecord(boolean medicalRecord) { this.medicalRecord = medicalRecord;}
    public String getHostel() { return hostel; }
    public void setHostel(String hostel) { this.hostel = hostel; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
