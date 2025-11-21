package com.mis.model;

import java.time.LocalDate;
import java.time.Period;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "students")
public class Student {

    @Id
    private String id;

    @OneToOne
    @JoinColumn(name = "id")
    @MapsId
    private User user;

    private String faculty;
    private LocalDate dateOfBirth;
    private String gender;
    private String registrationNumber;
    private String hostel;
    private String roomNumber;
    private String phoneNumber;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getHostel() { return hostel; }
    public void setHostel(String hostel) { this.hostel = hostel; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    @Transient
    public String extractRegistrationNumberFromEmail() {
        if (this.user != null && this.user.getEmail() != null) {
            String email = this.user.getEmail();
            int atIndex = email.indexOf('@');
            
            if (atIndex != -1) {
                return email.substring(0, atIndex);
            }
        }
        
        return null;
    }

    /**
     * FIX: Added a transient method to calculate age dynamically.
     * The @Transient annotation tells JPA not to try to save this to the database.
     * @return The calculated age in years, or null if DOB is not set.
     */
    @Transient
    public Integer getAge() {
        if (this.dateOfBirth == null) {
            return null;
        }
        return Period.between(this.dateOfBirth, LocalDate.now()).getYears();
    }

}
