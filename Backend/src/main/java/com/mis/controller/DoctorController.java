package com.mis.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mis.dto.DiagnosisRequest;
import com.mis.dto.VitalsRequest;
import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.Diagnosis;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.model.User;
import com.mis.model.Vitals;
import com.mis.repository.AppointmentRepository;
import com.mis.repository.DiagnosisRepository;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.repository.UserRepository;
import com.mis.repository.VitalsRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final VitalsRepository vitalsRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;

    public DoctorController(AppointmentRepository appointmentRepository, UserRepository userRepository,
                          VitalsRepository vitalsRepository, DiagnosisRepository diagnosisRepository,
                          StudentRepository studentRepository, StaffRepository staffRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.vitalsRepository = vitalsRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<Appointment>> getTodaysAppointments(Authentication authentication) {
        // Get today's date range
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        
        // Convert to Date objects
        Date startDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());
        
        // Fetch appointments for today
        List<Appointment> todaysAppointments = appointmentRepository.findAppointmentsForDay(startDate, endDate);
        
        return ResponseEntity.ok(todaysAppointments);
    }

    @GetMapping("/appointments/queue")
    public ResponseEntity<List<Appointment>> getAppointmentQueue(Authentication authentication) {
        // Get all scheduled appointments ordered by appointment date/time
        List<Appointment> queuedAppointments = appointmentRepository.findByStatusOrderByAppointmentDateTimeAsc(AppointmentStatus.Scheduled);
        
        return ResponseEntity.ok(queuedAppointments);
    }

    @GetMapping("/appointments/all")
    public ResponseEntity<List<Appointment>> getAllAppointments(Authentication authentication) {
        // Get all appointments ordered by appointment date/time (most recent first)
        List<Appointment> allAppointments = appointmentRepository.findAllByOrderByAppointmentDateTimeDesc();
        
        return ResponseEntity.ok(allAppointments);
    }

    @PutMapping("/appointments/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(Authentication authentication, @PathVariable String appointmentId) {
        // Find the appointment by its ID
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if appointment is in valid state to be completed
        if (appointment.getStatus() != AppointmentStatus.Scheduled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "This appointment cannot be completed. Current status: " + appointment.getStatus()));
        }

        // Update the status to COMPLETED
        appointment.setStatus(AppointmentStatus.Completed);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok().body(Map.of("message", "Appointment completed successfully."));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        // Get today's date range
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        
        Date startDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());
        
        // Get various statistics
        List<Appointment> todaysAppointments = appointmentRepository.findAppointmentsForDay(startDate, endDate);
        long totalScheduled = appointmentRepository.countByStatus(AppointmentStatus.Scheduled);
        long todaysCompleted = todaysAppointments.stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.Completed)
                .count();
        
        Map<String, Object> stats = Map.of(
            "todaysTotal", todaysAppointments.size(),
            "todaysCompleted", todaysCompleted,
            "totalScheduled", totalScheduled,
            "todaysPending", todaysAppointments.size() - todaysCompleted
        );
        
        return ResponseEntity.ok(stats);
    }

    // Patient Profile Endpoints
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> getPatientProfile(@PathVariable String patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Get patient details based on role
        Object patientDetails = null;
        if (patient.getRole() == Role.Student) {
            patientDetails = studentRepository.findById(patientId).orElse(null);
        } else if (patient.getRole() == Role.Staff) {
            patientDetails = staffRepository.findById(patientId).orElse(null);
        }
        
        // Get latest vitals
        Vitals latestVitals = vitalsRepository.findLatestVitalsByPatient(patient).orElse(null);
        
        // Get recent diagnoses
        List<Diagnosis> recentDiagnoses = diagnosisRepository.findByPatientOrderByDiagnosisDateDesc(patient)
                .stream().limit(10).toList();
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("patient", patient);
        profile.put("patientDetails", patientDetails);
        profile.put("latestVitals", latestVitals);
        profile.put("recentDiagnoses", recentDiagnoses);
        
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/patients/{patientId}/vitals")
    public ResponseEntity<List<Vitals>> getPatientVitals(@PathVariable String patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<Vitals> vitals = vitalsRepository.findByPatientOrderByRecordedAtDesc(patient);
        return ResponseEntity.ok(vitals);
    }

    @PostMapping("/patients/{patientId}/vitals")
    public ResponseEntity<?> savePatientVitals(Authentication authentication, 
                                             @PathVariable String patientId, 
                                             @RequestBody VitalsRequest request) {
        try {
            String doctorId = authentication.getName();
            User patient = userRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            Vitals vitals = new Vitals();
            vitals.setId(UUID.randomUUID().toString());
            vitals.setPatient(patient);
            vitals.setRecordedBy(doctorId);
            vitals.setRecordedAt(new Date());
            
            // Set vitals data - handle null values gracefully
            vitals.setHeightCm(request.getHeightCm());
            vitals.setWeightKg(request.getWeightKg());
            vitals.setTemperatureC(request.getTemperatureC());
            vitals.setSystolicBp(request.getSystolicBp());
            vitals.setDiastolicBp(request.getDiastolicBp());
            vitals.setHeartRate(request.getHeartRate());
            vitals.setRespiratoryRate(request.getRespiratoryRate());
            vitals.setOxygenSaturation(request.getOxygenSaturation());
            vitals.setNotes(request.getNotes());
            
            Vitals savedVitals = vitalsRepository.save(vitals);
            return ResponseEntity.ok(savedVitals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error saving vitals: " + e.getMessage()));
        }
    }

    @PostMapping("/patients/{patientId}/diagnosis")
    public ResponseEntity<?> saveDiagnosis(Authentication authentication,
                                         @PathVariable String patientId,
                                         @RequestBody DiagnosisRequest request) {
        try {
            String doctorId = authentication.getName();
            User patient = userRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            Diagnosis diagnosis = new Diagnosis();
            diagnosis.setId(UUID.randomUUID().toString());
            diagnosis.setPatient(patient);
            diagnosis.setDoctorId(doctorId);
            diagnosis.setDiagnosisDate(new Date());
            diagnosis.setDiagnosis(request.getDiagnosis());
            diagnosis.setNotes(request.getNotes());
            diagnosis.setCreatedAt(new Date());
            
            // Link to appointment if provided
            if (request.getAppointmentId() != null && !request.getAppointmentId().trim().isEmpty()) {
                Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
                diagnosis.setAppointment(appointment);
            }
            
            Diagnosis savedDiagnosis = diagnosisRepository.save(diagnosis);
            return ResponseEntity.ok(savedDiagnosis);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error saving diagnosis: " + e.getMessage()));
        }
    }
}