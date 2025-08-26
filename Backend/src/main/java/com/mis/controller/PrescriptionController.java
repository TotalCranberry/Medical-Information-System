package com.mis.controller;

import com.mis.dto.prescription.*;
import com.mis.model.Prescription;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import com.mis.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;


    private String resolveUserIdentifier(Authentication authentication) {
        if (authentication == null) return null;

        String id = authentication.getName();
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails ud) {

            String u = ud.getUsername();
            if (u != null && u.contains("@")) {
                id = u;
            }
        }
        return id != null ? id.trim() : null;
    }

    private Optional<User> findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.trim());
        }
        return userRepository.findById(identifier.trim());
    }


    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_Doctor')")
    public ResponseEntity<?> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequestDTO requestDTO,
            Authentication authentication) {

        try {
            log.info("=== AUTH DEBUG === auth={}, principal={}, authorities={}",
                    authentication,
                    authentication != null ? authentication.getPrincipal() : null,
                    authentication != null ? authentication.getAuthorities() : null);

            String identifier = resolveUserIdentifier(authentication);
            if (identifier == null || identifier.isBlank()) {
                log.error("No user info found in Authentication");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "No user information found in authentication"));
            }

            Optional<User> doctorOpt = findUserByIdentifier(identifier);
            if (doctorOpt.isEmpty()) {
                log.error("Doctor not found with identifier: {}", identifier);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Doctor not found"));
            }

            User doctor = doctorOpt.get();
            log.info("Creating prescription by Doctor[id={}, name={}, email={}, role={}], patient='{}'",
                    doctor.getId(), doctor.getName(), doctor.getEmail(), doctor.getRole(), requestDTO.getPatientName());

            PrescriptionResponseDTO response =
                    prescriptionService.createPrescription(requestDTO, doctor.getId(), doctor.getName());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Prescription created successfully", "data", response));

        } catch (Exception e) {
            log.error("Error creating prescription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to create prescription: " + e.getMessage(),
                            "error_type", e.getClass().getSimpleName()));
        }
    }


    @GetMapping("/{prescriptionId}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionById(@PathVariable String prescriptionId) {
        try {
            Optional<PrescriptionResponseDTO> prescription = prescriptionService.getPrescriptionById(prescriptionId);
            return prescription.<ResponseEntity<?>>map(dto -> ResponseEntity.ok(Map.of("success", true, "data", dto)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Prescription not found")));
        } catch (Exception e) {
            log.error("Error fetching prescription by ID: {}", prescriptionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescription: " + e.getMessage()));
        }
    }


    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionsByPatientId(@PathVariable String patientId) {
        try {
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsByPatientId(patientId);
            return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
        } catch (Exception e) {
            log.error("Error fetching prescriptions for patient: {}", patientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }


    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionsByDoctorId(@PathVariable String doctorId) {
        try {
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsByDoctorId(doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
        } catch (Exception e) {
            log.error("Error fetching prescriptions for doctor: {}", doctorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }


    @GetMapping("/doctor/{doctorId}/recent")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Admin')")
    public ResponseEntity<?> getRecentPrescriptionsByDoctor(@PathVariable String doctorId) {
        try {
            List<PrescriptionSummaryDTO> prescriptions = prescriptionService.getRecentPrescriptionsByDoctor(doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
        } catch (Exception e) {
            log.error("Error fetching recent prescriptions for doctor: {}", doctorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }


    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "requestDate") String sortBy) {
        try {
            Prescription.PrescriptionStatus prescriptionStatus =
                    Prescription.PrescriptionStatus.valueOf(status.toUpperCase());

            if (page >= 0 && size > 0) {
                Page<PrescriptionSummaryDTO> prescriptions =
                        prescriptionService.getPrescriptionsByStatus(prescriptionStatus, page, size, sortBy);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", prescriptions.getContent(),
                        "totalElements", prescriptions.getTotalElements(),
                        "totalPages", prescriptions.getTotalPages(),
                        "currentPage", prescriptions.getNumber(),
                        "size", prescriptions.getSize()
                ));
            } else {
                List<PrescriptionSummaryDTO> prescriptions =
                        prescriptionService.getPrescriptionsByStatus(prescriptionStatus);

                return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Invalid prescription status: " + status));
        } catch (Exception e) {
            log.error("Error fetching prescriptions by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }


    @GetMapping("/pharmacist/queue")
    @PreAuthorize("hasAnyAuthority('ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionsForPharmacist() {
        try {
            List<PrescriptionSummaryDTO> prescriptions = prescriptionService.getPrescriptionsForPharmacist();
            return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
        } catch (Exception e) {
            log.error("Error fetching prescriptions for pharmacist", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }


    @PutMapping("/{prescriptionId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> updatePrescriptionStatus(
            @PathVariable String prescriptionId,
            @Valid @RequestBody UpdatePrescriptionStatusDTO updateDTO,
            Authentication authentication) {

        try {
            String identifier = resolveUserIdentifier(authentication);
            Optional<User> pharmacistOpt = findUserByIdentifier(identifier);
            if (pharmacistOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Pharmacist not found"));
            }

            User pharmacist = pharmacistOpt.get();

            PrescriptionResponseDTO response =
                    prescriptionService.updatePrescriptionStatus(
                            prescriptionId, updateDTO, pharmacist.getId(), pharmacist.getName());

            return ResponseEntity.ok(Map.of("success", true, "message",
                    "Prescription status updated successfully", "data", response));

        } catch (Exception e) {
            log.error("Error updating prescription status for ID: {}", prescriptionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to update prescription status: " + e.getMessage()));
        }
    }


    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> searchPrescriptionsByPatientName(@RequestParam String patientName) {
        try {
            List<PrescriptionSummaryDTO> prescriptions = prescriptionService.searchPrescriptionsByPatientName(patientName);
            return ResponseEntity.ok(Map.of("success", true, "data", prescriptions, "count", prescriptions.size()));
        } catch (Exception e) {
            log.error("Error searching prescriptions by patient name: {}", patientName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to search prescriptions: " + e.getMessage()));
        }
    }


    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_Pharmacist', 'ROLE_Admin')")
    public ResponseEntity<?> getPrescriptionStatistics() {
        try {
            PrescriptionService.PrescriptionStatisticsDTO statistics = prescriptionService.getPrescriptionStatistics();
            return ResponseEntity.ok(Map.of("success", true, "data", statistics));
        } catch (Exception e) {
            log.error("Error fetching prescription statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch statistics: " + e.getMessage()));
        }
    }


    @GetMapping("/doctor/{doctorId}/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Admin')")
    public ResponseEntity<?> getDoctorPrescriptionStatistics(@PathVariable String doctorId) {
        try {
            PrescriptionService.PrescriptionStatisticsDTO statistics =
                    prescriptionService.getDoctorPrescriptionStatistics(doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", statistics));
        } catch (Exception e) {
            log.error("Error fetching doctor prescription statistics for ID: {}", doctorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch statistics: " + e.getMessage()));
        }
    }


    @DeleteMapping("/{prescriptionId}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Admin')")
    public ResponseEntity<?> deletePrescription(
            @PathVariable String prescriptionId,
            Authentication authentication) {

        try {
            String identifier = resolveUserIdentifier(authentication);
            Optional<User> doctorOpt = findUserByIdentifier(identifier);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Doctor not found"));
            }

            prescriptionService.deletePrescription(prescriptionId, doctorOpt.get().getId());
            return ResponseEntity.ok(Map.of("success", true, "message", "Prescription deleted successfully"));

        } catch (Exception e) {
            log.error("Error deleting prescription with ID: {}", prescriptionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to delete prescription: " + e.getMessage()));
        }
    }
}
