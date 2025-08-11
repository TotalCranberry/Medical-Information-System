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
    private Integer age; // FIX: Changed from int to Integer to allow null values

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
    public Integer getAge() { return age; } // FIX: Getter now returns Integer
    public void setAge(Integer age) { this.age = age; } // FIX: Setter now accepts Integer
}
