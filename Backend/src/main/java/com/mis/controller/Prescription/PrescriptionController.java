package com.mis.controller.Prescription;

import com.mis.dto.prescription.PrescriptionCreateRequest;
import com.mis.dto.prescription.PrescriptionResponse;
import com.mis.dto.prescription.ManualDispenseRequest;
import com.mis.mapper.Prescription.PrescriptionMapper;
import com.mis.model.Prescription.Prescription;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import com.mis.service.Prescription.PrescriptionService;
import com.mis.service.Prescription.PrescriptionMigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PrescriptionMigrationService prescriptionMigrationService;
    private final UserRepository userRepository;

    // POST /api/prescriptions/create   (Doctor only)
    @PostMapping("/create")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<PrescriptionResponse> create(Authentication auth,
                                                        @RequestBody PrescriptionCreateRequest req) {

        // Resolve current doctor from auth principal (userId from JWT token)
        String doctorId = auth.getName();
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found for " + doctorId));

        var saved = prescriptionService.create(doctor.getId(), doctor.getName(), req);
        return ResponseEntity.ok(PrescriptionMapper.toResponse(saved));
    }

    // (You can add: GET by id, doctor/my-prescriptions, etc. later to match your frontend.)

    // 1) Pending queue for Pharmacy (active=true, newest first)
    @GetMapping("/pharmacy/pending")
    @PreAuthorize("hasAuthority('ROLE_Pharmacist')")
    public ResponseEntity<List<PrescriptionService.QueueRow>> pendingQueue() {
        return ResponseEntity.ok(prescriptionService.getPendingQueueLite());
    }
    // Completed prescriptions for Pharmacy (active=false, newest first)
    @GetMapping("/pharmacy/completed")
    @PreAuthorize("hasAuthority('ROLE_Pharmacist')")
    public ResponseEntity<List<Prescription>> completedPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getCompletedPrescriptions());
    }

    // 2) View a single prescription (fields auto-decrypted by JPA converter)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Doctor', 'ROLE_Pharmacist', 'ROLE_Student', 'ROLE_Staff')")
    public ResponseEntity<PrescriptionResponse> getOne(@PathVariable String id) {
        Prescription prescription = prescriptionService.getByIdOrThrow(id);
        return ResponseEntity.ok(PrescriptionMapper.toResponse(prescription));
    }

    // 3) Dispense: auto-decrement inventory + mark inactive
    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasAuthority('ROLE_Pharmacist')")
    public ResponseEntity<PrescriptionService.DispenseSummary> dispense(@PathVariable String id) {
        return ResponseEntity.ok(prescriptionService.dispenseAndComplete(id));
    }

        // 3b) Dispense manual: pharmacist-selected items/quantities (does not auto-complete)
        @PostMapping("/{id}/dispense-manual")
        @PreAuthorize("hasAuthority('ROLE_Pharmacist')")
        public ResponseEntity<PrescriptionService.DispenseSummary> dispenseManual(
                @PathVariable String id,
                @RequestBody ManualDispenseRequest req
        ) {
            return ResponseEntity.ok(prescriptionService.dispenseManual(id, req));
        }
    
        // 3c) Complete prescription (explicitly mark inactive after manual dispense)
        @PostMapping("/{id}/complete")
        @PreAuthorize("hasAuthority('ROLE_Pharmacist')")
        public ResponseEntity<Void> complete(@PathVariable String id) {
            prescriptionService.markComplete(id);
            return ResponseEntity.ok().build();
        }

    // 4) Completed prescriptions for Patient (active=false, newest first)
    @GetMapping("/patient/completed")
    @PreAuthorize("hasAuthority('ROLE_Student') or hasAuthority('ROLE_Staff')")
    public ResponseEntity<List<Prescription>> completedPrescriptionsForPatient(Authentication auth) {
        String patientId = auth.getName();
        System.out.println("DEBUG: Controller - Patient ID from auth: " + patientId);
        List<Prescription> prescriptions = prescriptionService.getCompletedPrescriptionsForPatient(patientId);
        System.out.println("DEBUG: Controller - Returning " + prescriptions.size() + " prescriptions");
        return ResponseEntity.ok(prescriptions);
    }

    // 5) Migration: re-encrypt existing data with current key (Admin only)
    @PostMapping("/migrate")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<String> migratePrescriptionData() {
        try {
            prescriptionMigrationService.migratePrescriptionData();
            return ResponseEntity.ok("Prescription data migration completed successfully. Check logs for details.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Migration failed: " + e.getMessage());
        }
    }
}
