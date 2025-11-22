package com.mis.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mis.dto.DiagnosisRequest;
import com.mis.dto.MedicalRecordResponseDTO;
import com.mis.dto.PatientDTO;
import com.mis.dto.VitalsRequest;
import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.Diagnosis;
import com.mis.model.Doctor;
import com.mis.model.Medical;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.model.User;
import com.mis.model.Vitals;
import com.mis.model.Prescription.Prescription;
import com.mis.repository.AppointmentRepository;
import com.mis.repository.DiagnosisRepository;
import com.mis.repository.DoctorRepository;
import com.mis.repository.MedicalRepository;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.repository.UserRepository;
import com.mis.repository.VitalsRepository;
import com.mis.service.MedicalFormService;
import com.mis.service.Prescription.PrescriptionService;
import com.mis.service.UserService;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final VitalsRepository vitalsRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final MedicalRepository medicalRepository;
    private final DoctorRepository doctorRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final MedicalFormService medicalFormService;
    private final PrescriptionService prescriptionService;
    private final UserService userService;

    public DoctorController(AppointmentRepository appointmentRepository, UserRepository userRepository,
            VitalsRepository vitalsRepository, DiagnosisRepository diagnosisRepository,
            MedicalRepository medicalRepository, DoctorRepository doctorRepository, StudentRepository studentRepository,
            StaffRepository staffRepository, MedicalFormService medicalFormService,
            PrescriptionService prescriptionService, UserService userService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.vitalsRepository = vitalsRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.medicalRepository = medicalRepository;
        this.doctorRepository = doctorRepository;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.medicalFormService = medicalFormService;
        this.prescriptionService = prescriptionService;
        this.userService = userService;
    }

    // NEW: Get all patients (Students and Staff) for the doctor's patient search
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients(Authentication authentication) {
        try {
            List<PatientDTO> allPatients = new ArrayList<>();
            
            // Get all students
            List<Student> students = studentRepository.findAll();
            for (Student student : students) {
                PatientDTO patientDTO = new PatientDTO();
                patientDTO.setId(student.getId());
                patientDTO.setName(student.getUser().getName());
                patientDTO.setEmail(student.getUser().getEmail());
                patientDTO.setRole("Student");
                patientDTO.setFaculty(student.getFaculty());
                patientDTO.setAge(student.getAge()); // This will use the transient method
                allPatients.add(patientDTO);
            }
            
            // Get all staff
            List<Staff> staff = staffRepository.findAll();
            for (Staff staffMember : staff) {
                PatientDTO patientDTO = new PatientDTO();
                patientDTO.setId(staffMember.getId());
                patientDTO.setName(staffMember.getUser().getName());
                patientDTO.setEmail(staffMember.getUser().getEmail());
                patientDTO.setRole("Staff");
                patientDTO.setFaculty(staffMember.getFaculty());
                patientDTO.setAge(staffMember.getAge()); // This will use the transient method
                allPatients.add(patientDTO);
            }
            
            // Sort by name for better user experience
            allPatients = allPatients.stream()
                .sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(allPatients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
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
        // patientId is the student/staff id, not user id
        User patient = null;
        Object patientDetails = null;

        Optional<Student> studentOpt = studentRepository.findById(patientId);
        if (studentOpt.isPresent()) {
            patient = studentOpt.get().getUser();
            patientDetails = studentOpt.get();
        } else {
            Optional<Staff> staffOpt = staffRepository.findById(patientId);
            if (staffOpt.isPresent()) {
                patient = staffOpt.get().getUser();
                patientDetails = staffOpt.get();
            } else {
                throw new RuntimeException("Patient not found");
            }
        }

        // Get latest vitals
        Vitals latestVitals = vitalsRepository.findLatestVitalsByPatient(patient).orElse(null);

        // Get recent diagnoses
        List<Diagnosis> recentDiagnoses = diagnosisRepository.findByPatientOrderByDiagnosisDateDesc(patient)
                .stream().limit(10).toList();

        // Get recent medicals
        List<Medical> recentMedicals = medicalRepository.findByPatientOrderByMedicalDateDesc(patient)
                .stream().limit(10).toList();

        Map<String, Object> profile = new HashMap<>();
        profile.put("patient", patient);
        profile.put("patientDetails", patientDetails);
        profile.put("latestVitals", latestVitals);
        profile.put("recentDiagnoses", recentDiagnoses);
        profile.put("recentMedicals", recentMedicals);

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/patients/{patientId}/vitals")
    public ResponseEntity<List<Vitals>> getPatientVitals(@PathVariable String patientId) {
        // patientId is the student/staff id
        User patient = null;
        Optional<Student> studentOpt = studentRepository.findById(patientId);
        if (studentOpt.isPresent()) {
            patient = studentOpt.get().getUser();
        } else {
            Optional<Staff> staffOpt = staffRepository.findById(patientId);
            if (staffOpt.isPresent()) {
                patient = staffOpt.get().getUser();
            } else {
                throw new RuntimeException("Patient not found");
            }
        }

        List<Vitals> vitals = vitalsRepository.findByPatientOrderByRecordedAtDesc(patient);
        return ResponseEntity.ok(vitals);
    }

    @PostMapping("/patients/{patientId}/vitals")
    public ResponseEntity<?> savePatientVitals(Authentication authentication,
                                              @PathVariable String patientId,
                                              @RequestBody VitalsRequest request) {
        try {
            String doctorId = authentication.getName();
            // patientId is the student/staff id
            User patient = null;
            Optional<Student> studentOpt = studentRepository.findById(patientId);
            if (studentOpt.isPresent()) {
                patient = studentOpt.get().getUser();
            } else {
                Optional<Staff> staffOpt = staffRepository.findById(patientId);
                if (staffOpt.isPresent()) {
                    patient = staffOpt.get().getUser();
                } else {
                    throw new RuntimeException("Patient not found");
                }
            }

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
            // patientId is the student/staff id
            User patient = null;
            Optional<Student> studentOpt = studentRepository.findById(patientId);
            if (studentOpt.isPresent()) {
                patient = studentOpt.get().getUser();
            } else {
                Optional<Staff> staffOpt = staffRepository.findById(patientId);
                if (staffOpt.isPresent()) {
                    patient = staffOpt.get().getUser();
                } else {
                    throw new RuntimeException("Patient not found");
                }
            }

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

    // Doctor Signature and Seal Upload
    @PostMapping("/upload-signature-seal")
    public ResponseEntity<?> uploadSignatureAndSeal(Authentication authentication,
                                                   @RequestParam(value = "doctorSignature", required = false) MultipartFile doctorSignature,
                                                   @RequestParam(value = "doctorSeal", required = false) MultipartFile doctorSeal) {
        try {
            String doctorId = authentication.getName();

            // Ensure Doctor entity exists
            userService.ensureDoctorEntityExists(doctorId);

            // Get the doctor
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            // Validate file sizes (1MB limit)
            if (doctorSignature != null && doctorSignature.getSize() > 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Doctor signature image must be less than 1MB"));
            }
            if (doctorSeal != null && doctorSeal.getSize() > 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Doctor seal image must be less than 1MB"));
            }

            // Handle file uploads
            if (doctorSignature != null && !doctorSignature.isEmpty()) {
                doctor.setDoctorSignature(doctorSignature.getBytes());
                doctor.setDoctorSignatureContentType(doctorSignature.getContentType());
            }
            if (doctorSeal != null && !doctorSeal.isEmpty()) {
                doctor.setDoctorSeal(doctorSeal.getBytes());
                doctor.setDoctorSealContentType(doctorSeal.getContentType());
            }

            Doctor savedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Signature and seal uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error uploading signature and seal: " + e.getMessage()));
        }
    }

    // Get Doctor's Signature and Seal
    @GetMapping("/signature-seal")
    public ResponseEntity<Map<String, Object>> getSignatureAndSeal(Authentication authentication) {
        try {
            String doctorId = authentication.getName();

            // Ensure Doctor entity exists
            userService.ensureDoctorEntityExists(doctorId);

            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Map<String, Object> response = new HashMap<>();

            // Convert signature to base64
            if (doctor.getDoctorSignature() != null && doctor.getDoctorSignature().length > 0) {
                String base64Signature = Base64.getEncoder().encodeToString(doctor.getDoctorSignature());
                String mimeType = doctor.getDoctorSignatureContentType() != null ? doctor.getDoctorSignatureContentType() : "image/png";
                response.put("doctorSignature", "data:" + mimeType + ";base64," + base64Signature);
            }

            // Convert seal to base64
            if (doctor.getDoctorSeal() != null && doctor.getDoctorSeal().length > 0) {
                String base64Seal = Base64.getEncoder().encodeToString(doctor.getDoctorSeal());
                String mimeType = doctor.getDoctorSealContentType() != null ? doctor.getDoctorSealContentType() : "image/png";
                response.put("doctorSeal", "data:" + mimeType + ";base64," + base64Seal);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error retrieving signature and seal: " + e.getMessage()));
        }
    }

    // Medical Endpoints
    @PostMapping("/patients/{patientId}/medical")
    public ResponseEntity<?> issueMedical(Authentication authentication,
                                           @PathVariable String patientId,
                                           @RequestParam("recommendations") String recommendations,
                                           @RequestParam(value = "additionalNotes", required = false) String additionalNotes,
                                           @RequestParam(value = "appointmentId", required = false) String appointmentId,
                                           @RequestParam(value = "doctorSignature", required = false) MultipartFile doctorSignature,
                                           @RequestParam(value = "doctorSeal", required = false) MultipartFile doctorSeal,
                                           @RequestParam("password") String password) {
        try {
            String doctorId = authentication.getName();

            // Verify password
            User doctorUser = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            Optional<User> authenticatedUser = userService.authenticate(doctorUser.getEmail(), password);
            if (authenticatedUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid password"));
            }

            // patientId is the student/staff id
            User patient = null;
            Object patientDetails = null;
            Integer patientAge = null;
            String patientFaculty = null;

            Optional<Student> studentOpt = studentRepository.findById(patientId);
            if (studentOpt.isPresent()) {
                patient = studentOpt.get().getUser();
                patientDetails = studentOpt.get();
                patientFaculty = studentOpt.get().getFaculty();
                patientAge = calculateAge(studentOpt.get().getDateOfBirth());
            } else {
                Optional<Staff> staffOpt = staffRepository.findById(patientId);
                if (staffOpt.isPresent()) {
                    patient = staffOpt.get().getUser();
                    patientDetails = staffOpt.get();
                    patientFaculty = staffOpt.get().getFaculty();
                    patientAge = calculateAge(staffOpt.get().getDateOfBirth());
                } else {
                    throw new RuntimeException("Patient not found");
                }
            }

            // Validate file sizes (1MB limit)
            if (doctorSignature != null && doctorSignature.getSize() > 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Doctor signature image must be less than 1MB"));
            }
            if (doctorSeal != null && doctorSeal.getSize() > 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Doctor seal image must be less than 1MB"));
            }

            Medical medical = new Medical();
            medical.setId(UUID.randomUUID().toString());
            medical.setPatient(patient);
            medical.setDoctorId(doctorId);
            medical.setPatientName(patient.getName());
            medical.setPatientAge(patientAge);
            medical.setPatientEmail(patient.getEmail());
            medical.setPatientFaculty(patientFaculty);
            medical.setPatientRole(patient.getRole().toString());
            medical.setRecommendations(recommendations);
            medical.setAdditionalNotes(additionalNotes);
            medical.setMedicalDate(new Date());
            medical.setCreatedAt(new Date());

            // Handle file uploads - save uploaded images to this medical record
            if (doctorSignature != null && !doctorSignature.isEmpty()) {
                medical.setDoctorSignature(doctorSignature.getBytes());
                medical.setDoctorSignatureContentType(doctorSignature.getContentType());
            }
            if (doctorSeal != null && !doctorSeal.isEmpty()) {
                medical.setDoctorSeal(doctorSeal.getBytes());
                medical.setDoctorSealContentType(doctorSeal.getContentType());
            }

            // Link to appointment if provided
            if (appointmentId != null && !appointmentId.trim().isEmpty()) {
                Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
                medical.setAppointment(appointment);
            }

            Medical savedMedical = medicalRepository.save(medical);
            return ResponseEntity.ok(savedMedical);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error issuing medical: " + e.getMessage()));
        }
    }

    @GetMapping("/patients/{patientId}/prescriptions")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable String patientId) {
        // patientId is the student/staff id
        User patient = null;
        Optional<Student> studentOpt = studentRepository.findById(patientId);
        if (studentOpt.isPresent()) {
            patient = studentOpt.get().getUser();
        } else {
            Optional<Staff> staffOpt = staffRepository.findById(patientId);
            if (staffOpt.isPresent()) {
                patient = staffOpt.get().getUser();
            } else {
                throw new RuntimeException("Patient not found");
            }
        }

        List<Prescription> prescriptions = prescriptionService.getAllPrescriptionsForPatient(patient.getId());
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/patients/{patientId}/medicals")
    public ResponseEntity<List<Map<String, Object>>> getPatientMedicals(@PathVariable String patientId) {
        // patientId is the student/staff id
        User patient = null;
        Optional<Student> studentOpt = studentRepository.findById(patientId);
        if (studentOpt.isPresent()) {
            patient = studentOpt.get().getUser();
        } else {
            Optional<Staff> staffOpt = staffRepository.findById(patientId);
            if (staffOpt.isPresent()) {
                patient = staffOpt.get().getUser();
            } else {
                throw new RuntimeException("Patient not found");
            }
        }

        List<Medical> medicals = medicalRepository.findByPatientOrderByMedicalDateDesc(patient);
        List<Map<String, Object>> medicalDTOs = new ArrayList<>();

        for (Medical medical : medicals) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", medical.getId());
            dto.put("patientName", medical.getPatientName());
            dto.put("patientRole", medical.getPatientRole());
            dto.put("patientAge", medical.getPatientAge());
            dto.put("patientFaculty", medical.getPatientFaculty());
            dto.put("patientEmail", medical.getPatientEmail());
            dto.put("recommendations", medical.getRecommendations());
            dto.put("additionalNotes", medical.getAdditionalNotes());
            dto.put("medicalDate", medical.getMedicalDate());
            dto.put("createdAt", medical.getCreatedAt());
            dto.put("isSentToCourseUnit", medical.getIsSentToCourseUnit());
            dto.put("sentToCourseUnitAt", medical.getSentToCourseUnitAt());

            // Convert images to base64
            if (medical.getDoctorSignature() != null && medical.getDoctorSignature().length > 0) {
                String base64Signature = Base64.getEncoder().encodeToString(medical.getDoctorSignature());
                String mimeType = medical.getDoctorSignatureContentType() != null ? medical.getDoctorSignatureContentType() : "image/png";
                dto.put("doctorSignature", "data:" + mimeType + ";base64," + base64Signature);
            }
            if (medical.getDoctorSeal() != null && medical.getDoctorSeal().length > 0) {
                String base64Seal = Base64.getEncoder().encodeToString(medical.getDoctorSeal());
                String mimeType = medical.getDoctorSealContentType() != null ? medical.getDoctorSealContentType() : "image/png";
                dto.put("doctorSeal", "data:" + mimeType + ";base64," + base64Seal);
            }

            medicalDTOs.add(dto);
        }

        return ResponseEntity.ok(medicalDTOs);
    }

    @GetMapping("/medicals/{medicalId}")
    public ResponseEntity<Map<String, Object>> getMedical(@PathVariable String medicalId) {
        Medical medical = medicalRepository.findById(medicalId)
                .orElseThrow(() -> new RuntimeException("Medical not found"));

        Map<String, Object> dto = new HashMap<>();
        dto.put("id", medical.getId());
        dto.put("patientName", medical.getPatientName());
        dto.put("patientRole", medical.getPatientRole());
        dto.put("patientAge", medical.getPatientAge());
        dto.put("patientFaculty", medical.getPatientFaculty());
        dto.put("patientEmail", medical.getPatientEmail());
        dto.put("recommendations", medical.getRecommendations());
        dto.put("additionalNotes", medical.getAdditionalNotes());
        dto.put("medicalDate", medical.getMedicalDate());
        dto.put("createdAt", medical.getCreatedAt());
        dto.put("isSentToCourseUnit", medical.getIsSentToCourseUnit());
        dto.put("sentToCourseUnitAt", medical.getSentToCourseUnitAt());

        // Convert images to base64
        if (medical.getDoctorSignature() != null && medical.getDoctorSignature().length > 0) {
            String base64Signature = Base64.getEncoder().encodeToString(medical.getDoctorSignature());
            dto.put("doctorSignature", "data:image/png;base64," + base64Signature);
        }
        if (medical.getDoctorSeal() != null && medical.getDoctorSeal().length > 0) {
            String base64Seal = Base64.getEncoder().encodeToString(medical.getDoctorSeal());
            dto.put("doctorSeal", "data:image/png;base64," + base64Seal);
        }

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/medicals/{medicalId}/send-to-course-unit")
    public ResponseEntity<?> sendMedicalToCourseUnit(Authentication authentication, @PathVariable String medicalId) {
        try {
            Medical medical = medicalRepository.findById(medicalId)
                    .orElseThrow(() -> new RuntimeException("Medical not found"));
            
            if (medical.getIsSentToCourseUnit()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Medical has already been sent to course unit"));
            }
            
            medical.setIsSentToCourseUnit(true);
            medical.setSentToCourseUnitAt(new Date());
            
            Medical updatedMedical = medicalRepository.save(medical);
            return ResponseEntity.ok(Map.of(
                "message", "Medical sent to course unit successfully",
                "medical", updatedMedical
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error sending medical to course unit: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}/medical-record")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<MedicalRecordResponseDTO> getPatientMedicalRecord(@PathVariable String patientId) {
        // patientId is the student/staff id, but medicalFormService uses userId
        User patient = null;
        Optional<Student> studentOpt = studentRepository.findById(patientId);
        if (studentOpt.isPresent()) {
            patient = studentOpt.get().getUser();
        } else {
            Optional<Staff> staffOpt = staffRepository.findById(patientId);
            if (staffOpt.isPresent()) {
                patient = staffOpt.get().getUser();
            } else {
                return ResponseEntity.notFound().build();
            }
        }

        Optional<MedicalRecordResponseDTO> dtoOpt = medicalFormService.getFullMedicalRecordByUserId(patient.getId());

        return dtoOpt.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Helper method to calculate age from LocalDate
    private Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return null;
        
        LocalDate currentDate = LocalDate.now();
        return java.time.Period.between(dateOfBirth, currentDate).getYears();
    }
    
    // Overloaded helper method to calculate age from Date (if needed elsewhere)
    private Integer calculateAge(Date dateOfBirth) {
        if (dateOfBirth == null) return null;
        
        LocalDate birthDate = dateOfBirth.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return calculateAge(birthDate);
    }
}