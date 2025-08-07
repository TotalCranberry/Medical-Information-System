package com.mis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SupportRequest {

    @NotBlank(message = "Message cannot be blank")
    @Size(min = 10, max = 500, message = "Message must be between 10 and 500 characters")
    private String message;

    // Getter and Setter
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
