package com.mis.controller;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mis.dto.AppointmentRequest;
import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.User;
import com.mis.repository.AppointmentRepository;
import com.mis.repository.UserRepository;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/patient") 
public class PatientController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public PatientController(AppointmentRepository appointmentRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<?>> getAppointments(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<Appointment> appointments = appointmentRepository.findByPatientOrderByAppointmentDateTimeDesc(patient);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(Authentication authentication, @Valid @RequestBody AppointmentRequest request) {
        if (appointmentRepository.existsByAppointmentDateTime(request.getAppointmentDateTime())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message","An appointment already exists at this time slot. Please choose another."));
        }

        Instant instant = request.getAppointmentDateTime().toInstant();
        // Using a specific timezone is more reliable, e.g., ZoneId.of("Asia/Colombo")
        ZoneId zoneId = ZoneId.systemDefault(); 
        LocalDateTime ldt = instant.atZone(zoneId).toLocalDateTime();

        DayOfWeek day = ldt.getDayOfWeek();
        LocalTime time = ldt.toLocalTime();

        // 2. Check for weekends
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return ResponseEntity.badRequest().body(Map.of("message","Appointments cannot be booked on weekends."));
        }

        // 3. Check for valid clinic hours
        LocalTime morningStart = LocalTime.of(9, 0);
        LocalTime morningEnd = LocalTime.of(12, 0);
        LocalTime afternoonStart = LocalTime.of(13, 30);
        LocalTime afternoonEnd = LocalTime.of(16, 0);

        boolean isMorningSlot = !time.isBefore(morningStart) && time.isBefore(morningEnd);
        boolean isAfternoonSlot = !time.isBefore(afternoonStart) && time.isBefore(afternoonEnd);

        if (!isMorningSlot && !isAfternoonSlot) {
            return ResponseEntity.badRequest().body(Map.of("message","Invalid appointment time. Please book between 9:00 AM - 12:00 PM or 1:30 PM - 4:00 PM."));
        }

        // --- If all checks pass, create the appointment ---
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = new Appointment();
        appointment.setId(UUID.randomUUID().toString());
        appointment.setPatient(patient);
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.Scheduled);
        appointment.setCreatedAt(new Date());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(Authentication authentication, @PathVariable String appointmentId) {
        String userId = authentication.getName();

        // Find the appointment by its ID
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Security Check: Ensure the user owns this appointment
        if (!appointment.getPatient().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message","You are not authorized to cancel this appointment."));
        }

        // Business Rule: Only allow cancellation if the appointment is still PENDING
        if (appointment.getStatus() != AppointmentStatus.Scheduled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message","This appointment can no longer be cancelled."));
        }

        // Update the status to CANCELLED
        appointment.setStatus(AppointmentStatus.Cancelled);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok().body(Map.of("message","Appointment cancelled successfully."));
    }

    // Placeholder for fetching prescriptions.
    @GetMapping("/prescriptions")
    public ResponseEntity<List<?>> getPrescriptions() {
        // TODO: Add logic to fetch real prescription data.
        System.out.println("GET /api/patient/prescriptions was called");
        return ResponseEntity.ok(Collections.emptyList());
    }
    @GetMapping("/reports")
    public ResponseEntity<List<?>> getPatientReports() {
        // TODO: Add logic here to fetch real medical reports from the database.
        System.out.println("GET /api/patient/reports was called");
        return ResponseEntity.ok(Collections.emptyList());
    }

}

