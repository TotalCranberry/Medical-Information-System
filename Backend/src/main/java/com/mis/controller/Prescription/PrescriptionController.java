package com.mis.controller.Prescription;

import com.mis.dto.prescription.PrescriptionCreateRequest;
import com.mis.dto.prescription.PrescriptionResponse;
import com.mis.mapper.Prescription.PrescriptionMapper;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import com.mis.service.Prescription.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
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
}
