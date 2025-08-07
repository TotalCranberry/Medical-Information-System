package com.mis.dto;

import java.util.Date;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppointmentRequest {

    @NotNull(message = "Appointment date and time cannot be null")
    @Future(message = "Appointment date must be in the future")
    private Date appointmentDateTime;

    @NotBlank(message = "Reason cannot be blank")
    private String reason;

    public Date getAppointmentDateTime() {
        return appointmentDateTime;
    }
    public void setAppointmentDateTime(Date appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
    public String getReason() {
        return reason;
    }
    public void setReason(String reason) {
        this.reason = reason;
    }
}
