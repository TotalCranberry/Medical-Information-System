package com.mis.controller;

import com.mis.dto.LabResultDTO;
import com.mis.dto.LabResultRequestDTO;
import com.mis.dto.LabResultStatsDTO;
import com.mis.service.LabResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lab-results")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "*") // Configure this based on your frontend URL
public class LabResultController {
    
    private final LabResultService labResultService;

    // ========== Dashboard Endpoints ==========
    
    /**
     * GET /api/lab-results/dashboard/stats
     * Get dashboard statistics for lab technician dashboard
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @GetMapping("/dashboard/stats")
    public ResponseEntity<LabResultStatsDTO> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        
        try {
            LabResultStatsDTO stats = labResultService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/dashboard/recent
     * Get recent activity for dashboard
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @GetMapping("/dashboard/recent")
    public ResponseEntity<List<LabResultDTO>> getRecentActivity() {
        log.info("Fetching recent lab results activity");
        
        try {
            List<LabResultDTO> recentResults = labResultService.getRecentActivity();
            return ResponseEntity.ok(recentResults);
        } catch (Exception e) {
            log.error("Error fetching recent activity: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== Main Lab Results Endpoints ==========
    
    /**
     * GET /api/lab-results
     * Get all lab results with optional status filtering
     * Query params: status (optional)
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<LabResultDTO>> getAllLabResults(
            @RequestParam(value = "status", required = false) String status) {
        log.info("Fetching lab results with status filter: {}", status);
        
        try {
            List<LabResultDTO> results = labResultService.getAllLabResults(status);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error fetching lab results: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/category/{category}
     * Get lab results by category for frontend filtering
     * Categories: newRequests, inProgress, completed, pending, critical
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LabResultDTO>> getLabResultsByCategory(
            @PathVariable @NotBlank String category) {
        log.info("Fetching lab results by category: {}", category);
        
        try {
            List<LabResultDTO> results = labResultService.getLabResultsByCategory(category);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error fetching lab results by category {}: {}", category, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/{id}
     * Get specific lab result by ID with full details
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<LabResultDTO> getLabResultById(@PathVariable @NotNull Long id) {
        log.info("Fetching lab result with ID: {}", id);
        
        try {
            Optional<LabResultDTO> result = labResultService.getLabResultById(id);
            return result.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching lab result with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== Lab Result Operations ==========
    
    /**
     * POST /api/lab-results
     * Create new lab result request
     */
    @PreAuthorize("hasRole('DOCTOR') or hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<LabResultDTO> createLabResult(@Valid @RequestBody LabResultRequestDTO requestDto) {
        log.info("Creating new lab result for patient: {}", requestDto.getPatientId());
        
        try {
            LabResultDTO createdResult = labResultService.createLabResult(requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdResult);
        } catch (Exception e) {
            log.error("Error creating lab result: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * PUT /api/lab-results/{id}
     * Update existing lab result
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<LabResultDTO> updateLabResult(
            @PathVariable @NotNull Long id, 
            @Valid @RequestBody LabResultRequestDTO requestDto) {
        log.info("Updating lab result with ID: {}", id);
        
        try {
            LabResultDTO updatedResult = labResultService.updateLabResult(id, requestDto);
            return ResponseEntity.ok(updatedResult);
        } catch (Exception e) {
            log.error("Error updating lab result with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // ========== Lab Result Workflow Operations ==========
    
    /**
     * PUT /api/lab-results/{id}/pick
     * Lab technician picks/accepts a lab result request
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    @PutMapping("/{id}/pick")
    public ResponseEntity<LabResultDTO> pickLabResultRequest(
            @PathVariable @NotNull Long id,
            Authentication authentication) {
        String technicianId = authentication.getName(); // Get current user ID
        log.info("Lab technician {} picking result request with ID: {}", technicianId, id);
        
        try {
            LabResultDTO pickedResult = labResultService.pickLabResultRequest(id, technicianId);
            return ResponseEntity.ok(pickedResult);
        } catch (Exception e) {
            log.error("Error picking lab result request with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * PUT /api/lab-results/{id}/upload
     * Upload/Complete lab result with test results
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    @PutMapping("/{id}/upload")
    public ResponseEntity<LabResultDTO> uploadLabResult(
            @PathVariable @NotNull Long id,
            @Valid @RequestBody LabResultRequestDTO resultData) {
        log.info("Uploading lab result with ID: {}", id);
        
        try {
            LabResultDTO uploadedResult = labResultService.uploadLabResult(id, resultData);
            return ResponseEntity.ok(uploadedResult);
        } catch (Exception e) {
            log.error("Error uploading lab result with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * DELETE /api/lab-results/{id}/reject
     * Reject a lab result request
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<String> rejectLabResultRequest(
            @PathVariable @NotNull Long id,
            @RequestParam(value = "reason", required = false) String reason) {
        log.info("Rejecting lab result request with ID: {}", id);
        
        try {
            labResultService.rejectLabResultRequest(id, reason);
            return ResponseEntity.ok("Lab result request rejected successfully");
        } catch (Exception e) {
            log.error("Error rejecting lab result request with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                               .body("Failed to reject lab result request: " + e.getMessage());
        }
    }

    // ========== Search and Filter Endpoints ==========
    
    /**
     * GET /api/lab-results/search/by-test
     * Search lab results by test name
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/search/by-test")
    public ResponseEntity<List<LabResultDTO>> searchByTestName(
            @RequestParam("name") @NotBlank String testName) {
        log.info("Searching lab results by test name: {}", testName);
        
        try {
            List<LabResultDTO> results = labResultService.searchByTestName(testName);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error searching lab results by test name {}: {}", testName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/search/by-patient
     * Search lab results by patient name
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/search/by-patient")
    public ResponseEntity<List<LabResultDTO>> searchByPatientName(
            @RequestParam("name") @NotBlank String patientName) {
        log.info("Searching lab results by patient name: {}", patientName);
        
        try {
            List<LabResultDTO> results = labResultService.searchByPatientName(patientName);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error searching lab results by patient name {}: {}", patientName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/patient/{patientId}
     * Get all lab results for specific patient
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabResultDTO>> getLabResultsForPatient(
            @PathVariable @NotBlank String patientId) {
        log.info("Fetching lab results for patient: {}", patientId);
        
        try {
            List<LabResultDTO> results = labResultService.getLabResultsForPatient(patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error fetching lab results for patient {}: {}", patientId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/technician/{technicianId}
     * Get lab results by specific technician
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<LabResultDTO>> getLabResultsByTechnician(
            @PathVariable @NotBlank String technicianId) {
        log.info("Fetching lab results by technician: {}", technicianId);
        
        try {
            List<LabResultDTO> results = labResultService.getLabResultsByTechnician(technicianId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error fetching lab results by technician {}: {}", technicianId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== Utility Endpoints ==========
    
    /**
     * GET /api/lab-results/{id}/exists
     * Check if lab result exists
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> labResultExists(@PathVariable @NotNull Long id) {
        try {
            boolean exists = labResultService.labResultExists(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            log.error("Error checking if lab result exists with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/lab-results/critical/count
     * Get count of critical pending results
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @GetMapping("/critical/count")
    public ResponseEntity<Long> getCriticalPendingCount() {
        try {
            long count = labResultService.getCriticalPendingCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error fetching critical pending count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * DELETE /api/lab-results/{id}
     * Delete lab result (Admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLabResult(@PathVariable @NotNull Long id) {
        log.info("Admin deleting lab result with ID: {}", id);
        
        try {
            labResultService.deleteLabResult(id);
            return ResponseEntity.ok("Lab result deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting lab result with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                               .body("Failed to delete lab result: " + e.getMessage());
        }
    }

    // ========== Batch Operations ==========
    
    /**
     * GET /api/lab-results/batch/status-update
     * Batch update multiple lab results status
     */
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('ADMIN')")
    @PutMapping("/batch/status-update")
    public ResponseEntity<String> batchUpdateStatus(
            @RequestBody List<Long> labResultIds,
            @RequestParam("status") String status) {
        log.info("Batch updating {} lab results to status: {}", labResultIds.size(), status);
        
        try {
            // Implementation would depend on adding batch operations to service
            // For now, return a placeholder response
            return ResponseEntity.ok("Batch update functionality to be implemented");
        } catch (Exception e) {
            log.error("Error in batch status update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                               .body("Failed to update lab results: " + e.getMessage());
        }
    }

    // ========== Exception Handling ==========
    
    /**
     * Handle validation errors
     */
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<String> handleValidationException(jakarta.validation.ConstraintViolationException e) {
        log.error("Validation error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                           .body("Validation error: " + e.getMessage());
    }
    
    /**
     * Handle general runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        log.error("Runtime error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                           .body("An error occurred: " + e.getMessage());
    }
}