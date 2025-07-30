package com.mis.dto;

public class LoginResponse {

    private String token; // JWT token or session token

    private String message;

    private String role;

    // Additional user info if needed (e.g., name, role)

    public LoginResponse(String token, String message, String role) {
        this.token = token;
        this.message = message;
        this.role = role; // Default role, can be set based on user data
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    
}
