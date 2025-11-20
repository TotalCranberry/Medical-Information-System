package com.mis.controller;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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
import com.mis.dto.MedicalFormRequest;
import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.Diagnosis;
import com.mis.model.LabRequest; // Import LabRequest
import com.mis.model.LabResult;
import com.mis.model.Medical;
import com.mis.model.Prescription.Prescription;
import com.mis.model.User;
import com.mis.repository.AppointmentRepository;
import com.mis.repository.DiagnosisRepository;
import com.mis.repository.LabRequestRepository; // Import Repository
import com.mis.repository.LabResultRepository;
import com.mis.repository.MedicalRepository;
import com.mis.repository.Prescription.PrescriptionRepository;
import com.mis.repository.UserRepository;
import com.mis.service.MedicalFormService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patient") 
public class PatientController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final MedicalRepository medicalRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final LabRequestRepository labRequestRepository; // Declare repository
    private final MedicalFormService medicalFormService;

    // Update Constructor to include LabRequestRepository
    public PatientController(AppointmentRepository appointmentRepository, 
                             DiagnosisRepository diagnosisRepository, 
                             LabResultRepository labResultRepository, 
                             LabRequestRepository labRequestRepository, // Inject here
                             MedicalRepository medicalRepository, 
                             PrescriptionRepository prescriptionRepository, 
                             UserRepository userRepository, 
                             MedicalFormService medicalFormService) {
        this.appointmentRepository = appointmentRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.labResultRepository = labResultRepository;
        this.labRequestRepository = labRequestRepository; // Assign here
        this.medicalRepository = medicalRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.medicalFormService = medicalFormService;
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<?>> getAppointments(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<Appointment> appointments = appointmentRepository.findByPatientOrderByAppointmentDateTimeDesc(patient);
        return ResponseEntity.ok(appointments);
    }

    // ... [Existing Appointment Logic: createAppointment, cancelAppointment] ...
    
    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(Authentication authentication, @Valid @RequestBody AppointmentRequest request) {
        if (appointmentRepository.existsByAppointmentDateTimeAndStatusNot(request.getAppointmentDateTime(), AppointmentStatus.Cancelled)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An appointment already exists at this time slot. Please choose another.");
        }

        Instant instant = request.getAppointmentDateTime().toInstant();
        ZoneId zoneId = ZoneId.systemDefault(); 
        LocalDateTime ldt = instant.atZone(zoneId).toLocalDateTime();

        DayOfWeek day = ldt.getDayOfWeek();
        LocalTime time = ldt.toLocalTime();

        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return ResponseEntity.badRequest().body(Map.of("message","Appointments cannot be booked on weekends."));
        }

        LocalTime morningStart = LocalTime.of(9, 0);
        LocalTime morningEnd = LocalTime.of(12, 0);
        LocalTime afternoonStart = LocalTime.of(13, 30);
        LocalTime afternoonEnd = LocalTime.of(16, 0);

        boolean isMorningSlot = !time.isBefore(morningStart) && time.isBefore(morningEnd);
        boolean isAfternoonSlot = !time.isBefore(afternoonStart) && time.isBefore(afternoonEnd);

        if (!isMorningSlot && !isAfternoonSlot) {
            return ResponseEntity.badRequest().body("Invalid appointment time. Please book between 9:00 AM - 12:00 PM or 1:30 PM - 4:00 PM.");
        }

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

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message","You are not authorized to cancel this appointment."));
        }

        if (appointment.getStatus() != AppointmentStatus.Scheduled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message","This appointment can no longer be cancelled."));
        }

        appointment.setStatus(AppointmentStatus.Cancelled);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok().body(Map.of("message","Appointment cancelled successfully."));
    }


    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getPrescriptions(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        List<Prescription> prescriptions = prescriptionRepository.findByPatient(patient);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<LabResult>> getReports(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        List<LabResult> labResults = labResultRepository.findByPatientOrderByCreatedAtDesc(patient); 
        return ResponseEntity.ok(labResults);
    }
    
    // NEW ENDPOINT: Get Lab Requests
    @GetMapping("/lab-requests")
    public ResponseEntity<List<LabRequest>> getLabRequests(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        // Fetch requests ordered by date (using the method added to repository in previous step)
        List<LabRequest> requests = labRequestRepository.findByPatientOrderByOrderDateDesc(patient);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/reports/diagnoses")
    public ResponseEntity<List<Diagnosis>> getPatientDiagnoses(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        List<Diagnosis> diagnoses = diagnosisRepository.findByPatientOrderByDiagnosisDateDesc(patient);
        return ResponseEntity.ok(diagnoses);
    }

    @GetMapping("/reports/medicals")
    public ResponseEntity<List<Medical>> getPatientMedicals(Authentication authentication) {
        String userId = authentication.getName();
        User patient = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Patient not found"));
        List<Medical> medicals = medicalRepository.findByPatientOrderByMedicalDateDesc(patient);
        return ResponseEntity.ok(medicals);
    }

    @PostMapping("/submit-medical-form")
    public ResponseEntity<?> submitMedicalForm(Authentication authentication, @Valid @RequestBody MedicalFormRequest request) {
        try {
            String userId = authentication.getName();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            medicalFormService.saveMedicalForm(user.getEmail(), request);
            return ResponseEntity.ok(Map.of("message", "Medical form submitted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to submit medical form: " + e.getMessage()));
        }
    }

    @GetMapping("/view-medical/{medicalId}")
    public ResponseEntity<Medical> getMedical(@PathVariable String medicalId) {
        Medical medical = medicalRepository.findById(medicalId)
                .orElseThrow(() -> new RuntimeException("Medical not found"));
        return ResponseEntity.ok(medical);
    }
}