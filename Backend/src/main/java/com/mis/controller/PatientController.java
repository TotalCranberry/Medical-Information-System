package com.mis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

// This controller handles all API requests for the patient/student role.
@RestController
@RequestMapping("/api/patient") // All endpoints in this controller will start with /api/patient
public class PatientController {

    // Placeholder for fetching appointments.
    @GetMapping("/appointments")
    public ResponseEntity<List<?>> getAppointments() {
        // TODO: Add logic to fetch real appointment data from the database for the logged-in user.
        System.out.println("GET /api/patient/appointments was called");
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Placeholder for creating an appointment.
    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, String> payload) {
        // TODO: Add logic to save the new appointment to the database.
        System.out.println("POST /api/patient/appointments was called with payload: " + payload);
        return ResponseEntity.ok(Map.of("message", "Appointment created successfully"));
    }

    // Placeholder for fetching reports.
    @GetMapping("/reports")
    public ResponseEntity<List<?>> getReports() {
        // TODO: Add logic to fetch real report data.
        System.out.println("GET /api/patient/reports was called");
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Placeholder for fetching prescriptions.
    @GetMapping("/prescriptions")
    public ResponseEntity<List<?>> getPrescriptions() {
        // TODO: Add logic to fetch real prescription data.
        System.out.println("GET /api/patient/prescriptions was called");
        return ResponseEntity.ok(Collections.emptyList());
    }
}

