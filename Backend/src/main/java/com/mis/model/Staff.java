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
@Table(name = "staff")
public class Staff {
    @Id
    private String id; 

    @OneToOne
    @JoinColumn(name = "id")
    @MapsId
    private User user;

    private String faculty;
    private LocalDate dateOfBirth;
    private String gender;

    // FIX: Removed the 'age' field.

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

    /**
     * FIX: Added a transient method to calculate age dynamically.
     * @return The calculated age in years, or null if DOB is not set.
     */
    @Transient
    public Integer getAge(){
        if (this.dateOfBirth == null) {
            return null;
        }
        return Period.between(this.dateOfBirth, LocalDate.now()).getYears();
    }
}
