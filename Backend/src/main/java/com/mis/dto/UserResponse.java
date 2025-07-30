package com.mis.dto;

import com.mis.model.AuthMethod;
import com.mis.model.Role;

public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private AuthMethod authMethod;
    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
    public AuthMethod getAuthMethod() {
        return authMethod;
    }
    public void setAuthMethod(AuthMethod authMethod) {
        this.authMethod = authMethod;
    }

    
}
