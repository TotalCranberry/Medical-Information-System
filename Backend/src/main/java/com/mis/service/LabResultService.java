package com.mis.service;

import com.mis.dto.LabResultDTO;
import com.mis.dto.LabResultRequestDTO;
import com.mis.dto.LabResultStatsDTO;
import com.mis.mapper.LabResultMapper;
import com.mis.model.LabResult;
import com.mis.model.LabResult.LabResultStatus;
import com.mis.model.User;
import com.mis.repository.LabResultRepository;
import com.mis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LabResultService {
    
    private final LabResultRepository labResultRepository;
    private final UserRepository userRepository;

    // ========== Dashboard Operations ==========
    
    /**
     * Get dashboard statistics for lab technician dashboard
     */
    @Transactional(readOnly = true)
    public LabResultStatsDTO getDashboardStats() {
        log.info("Fetching dashboard statistics");
        
        try {
            long pendingCount = labResultRepository.countByStatus(LabResultStatus.PENDING);
            long completedCount = labResultRepository.countByStatus(LabResultStatus.COMPLETED);
            long criticalPendingCount = labResultRepository.countByStatusAndIsCritical(LabResultStatus.PENDING, true);
            long todayCount = labResultRepository.findTodaysResults().size();
            
            // Additional stats for detailed view
            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
            long weekCount = labResultRepository.findRecentResults(weekAgo).size();
            
            LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
            long monthCount = labResultRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(monthAgo, LocalDateTime.now()).size();
            
            return LabResultMapper.toStatsDto(pendingCount, completedCount, criticalPendingCount, 
                                            todayCount, weekCount, monthCount);
                                            
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch dashboard statistics", e);
        }
    }
    
    /**
     * Get recent activity for dashboard
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> getRecentActivity() {
        log.info("Fetching recent lab results activity");
        
        try {
            List<LabResult> recentResults = labResultRepository.findRecentActivity();
            return LabResultMapper.toDtoListWithFormatting(recentResults);
        } catch (Exception e) {
            log.error("Error fetching recent activity: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch recent activity", e);
        }
    }

    // ========== Lab Results Management ==========
    
    /**
     * Get all lab results with optional status filtering
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> getAllLabResults(String statusFilter) {
        log.info("Fetching lab results with filter: {}", statusFilter);
        
        try {
            List<LabResult> results;
            
            if (statusFilter != null && !statusFilter.equalsIgnoreCase("all")) {
                LabResultStatus status = LabResultStatus.valueOf(statusFilter.toUpperCase());
                results = labResultRepository.findByStatusOrderByCreatedAtDesc(status);
            } else {
                results = labResultRepository.findAll();
            }
            
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status filter: {}", statusFilter);
            throw new RuntimeException("Invalid status filter provided", e);
        } catch (Exception e) {
            log.error("Error fetching lab results: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch lab results", e);
        }
    }
    
    /**
     * Get lab results by different categories for frontend filtering
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> getLabResultsByCategory(String category) {
        log.info("Fetching lab results by category: {}", category);
        
        try {
            List<LabResult> results;
            
            switch (category.toLowerCase()) {
                case "newrequests":
                case "ordered":
                    results = labResultRepository.findByStatusOrderByCreatedAtDesc(LabResultStatus.PENDING);
                    break;
                    
                case "inprogress":
                    // Results that are being processed (could be PENDING with assigned technician)
                    results = labResultRepository.findByStatusAndIsCriticalOrderByCreatedAtAsc(LabResultStatus.PENDING, true);
                    break;
                    
                case "completed":
                    results = labResultRepository.findByStatusOrderByCreatedAtDesc(LabResultStatus.COMPLETED);
                    break;
                    
                case "pending":
                case "pendingreview":
                    results = labResultRepository.findResultsReadyForReview();
                    break;
                    
                case "critical":
                    results = labResultRepository.findByStatusAndIsCriticalOrderByCreatedAtAsc(LabResultStatus.PENDING, true);
                    break;
                    
                default:
                    results = labResultRepository.findAll();
            }
            
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (Exception e) {
            log.error("Error fetching lab results by category {}: {}", category, e.getMessage());
            throw new RuntimeException("Failed to fetch lab results by category", e);
        }
    }
    
    /**
     * Get specific lab result by ID with full details
     */
    @Transactional(readOnly = true)
    public Optional<LabResultDTO> getLabResultById(Long id) {
        log.info("Fetching lab result with ID: {}", id);
        
        try {
            Optional<LabResult> labResult = labResultRepository.findByIdWithDetails(id);
            return labResult.map(LabResultMapper::toDtoWithFormatting);
        } catch (Exception e) {
            log.error("Error fetching lab result with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch lab result", e);
        }
    }

    // ========== Lab Result Operations ==========
    
    /**
     * Create new lab result request
     */
    public LabResultDTO createLabResult(LabResultRequestDTO requestDto) {
        log.info("Creating new lab result for patient: {}", requestDto.getPatientId());
        
        try {
            // Fetch patient and lab technician
            User patient = userRepository.findById(requestDto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + requestDto.getPatientId()));
            
            User labTechnician = userRepository.findById(requestDto.getUploadedById())
                    .orElseThrow(() -> new RuntimeException("Lab technician not found with ID: " + requestDto.getUploadedById()));
            
            // Create entity
            LabResult labResult = LabResultMapper.toEntity(requestDto, patient, labTechnician);
            labResult.setStatus(LabResultStatus.PENDING);
            labResult.setCreatedAt(LocalDateTime.now());
            
            // Save to database
            LabResult savedResult = labResultRepository.save(labResult);
            
            log.info("Successfully created lab result with ID: {}", savedResult.getId());
            return LabResultMapper.toDtoWithFormatting(savedResult);
            
        } catch (Exception e) {
            log.error("Error creating lab result: {}", e.getMessage());
            throw new RuntimeException("Failed to create lab result", e);
        }
    }
    
    /**
     * Update existing lab result
     */
    public LabResultDTO updateLabResult(Long id, LabResultRequestDTO requestDto) {
        log.info("Updating lab result with ID: {}", id);
        
        try {
            LabResult existingResult = labResultRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found with ID: " + id));
            
            // Update entity with new data
            LabResultMapper.updateEntityFromDto(existingResult, requestDto);
            
            // Save updated entity
            LabResult updatedResult = labResultRepository.save(existingResult);
            
            log.info("Successfully updated lab result with ID: {}", id);
            return LabResultMapper.toDtoWithFormatting(updatedResult);
            
        } catch (Exception e) {
            log.error("Error updating lab result with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update lab result", e);
        }
    }
    
    /**
     * Pick/Accept a lab result request (change status to in progress)
     */
    public LabResultDTO pickLabResultRequest(Long id, String technicianId) {
        log.info("Lab technician {} picking result request with ID: {}", technicianId, id);
        
        try {
            LabResult labResult = labResultRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found with ID: " + id));
            
            if (labResult.getStatus() != LabResultStatus.PENDING) {
                throw new RuntimeException("Lab result is not in PENDING status");
            }
            
            // Update technician if different
            if (!technicianId.equals(labResult.getUploadedBy().getId())) {
                User newTechnician = userRepository.findById(technicianId)
                        .orElseThrow(() -> new RuntimeException("Lab technician not found with ID: " + technicianId));
                labResult.setUploadedBy(newTechnician);
            }
            
            // Keep status as PENDING but mark as picked (you could add a separate field for this)
            LabResult updatedResult = labResultRepository.save(labResult);
            
            log.info("Successfully picked lab result request with ID: {}", id);
            return LabResultMapper.toDtoWithFormatting(updatedResult);
            
        } catch (Exception e) {
            log.error("Error picking lab result request with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to pick lab result request", e);
        }
    }
    
    /**
     * Upload/Complete lab result
     */
    public LabResultDTO uploadLabResult(Long id, LabResultRequestDTO resultData) {
        log.info("Uploading lab result with ID: {}", id);
        
        try {
            LabResult labResult = labResultRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found with ID: " + id));
            
            // Update result data
            labResult.setResult(resultData.getResult());
            labResult.setReferenceRange(resultData.getReferenceRange());
            labResult.setUnits(resultData.getUnits());
            labResult.setIsCritical(resultData.getIsCritical());
            labResult.setStatus(LabResultStatus.COMPLETED);
            
            LabResult updatedResult = labResultRepository.save(labResult);
            
            log.info("Successfully uploaded lab result with ID: {}", id);
            return LabResultMapper.toDtoWithFormatting(updatedResult);
            
        } catch (Exception e) {
            log.error("Error uploading lab result with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to upload lab result", e);
        }
    }
    
    /**
     * Reject a lab result request
     */
    public void rejectLabResultRequest(Long id, String reason) {
        log.info("Rejecting lab result request with ID: {}", id);
        
        try {
            LabResult labResult = labResultRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found with ID: " + id));
            
            if (labResult.getStatus() != LabResultStatus.PENDING) {
                throw new RuntimeException("Only PENDING lab results can be rejected");
            }
            
            // For now, we'll delete the rejected request
            // In a more complex system, you might want to keep a rejection log
            labResultRepository.delete(labResult);
            
            log.info("Successfully rejected lab result request with ID: {}", id);
            
        } catch (Exception e) {
            log.error("Error rejecting lab result request with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to reject lab result request", e);
        }
    }

    // ========== Search and Filter Operations ==========
    
    /**
     * Search lab results by test name
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> searchByTestName(String testName) {
        log.info("Searching lab results by test name: {}", testName);
        
        try {
            List<LabResult> results = labResultRepository.findByTestNameContainingIgnoreCaseOrderByCreatedAtDesc(testName);
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (Exception e) {
            log.error("Error searching lab results by test name {}: {}", testName, e.getMessage());
            throw new RuntimeException("Failed to search lab results", e);
        }
    }
    
    /**
     * Search lab results by patient name
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> searchByPatientName(String patientName) {
        log.info("Searching lab results by patient name: {}", patientName);
        
        try {
            List<LabResult> results = labResultRepository.findByPatientNameContaining(patientName);
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (Exception e) {
            log.error("Error searching lab results by patient name {}: {}", patientName, e.getMessage());
            throw new RuntimeException("Failed to search lab results", e);
        }
    }
    
    /**
     * Get lab results for specific patient
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> getLabResultsForPatient(String patientId) {
        log.info("Fetching lab results for patient: {}", patientId);
        
        try {
            List<LabResult> results = labResultRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (Exception e) {
            log.error("Error fetching lab results for patient {}: {}", patientId, e.getMessage());
            throw new RuntimeException("Failed to fetch patient lab results", e);
        }
    }
    
    /**
     * Get lab results by technician
     */
    @Transactional(readOnly = true)
    public List<LabResultDTO> getLabResultsByTechnician(String technicianId) {
        log.info("Fetching lab results by technician: {}", technicianId);
        
        try {
            List<LabResult> results = labResultRepository.findByUploadedByIdOrderByCreatedAtDesc(technicianId);
            return LabResultMapper.toDtoListWithFormatting(results);
        } catch (Exception e) {
            log.error("Error fetching lab results by technician {}: {}", technicianId, e.getMessage());
            throw new RuntimeException("Failed to fetch technician lab results", e);
        }
    }

    // ========== Utility Methods ==========
    
    /**
     * Check if a lab result exists
     */
    @Transactional(readOnly = true)
    public boolean labResultExists(Long id) {
        return labResultRepository.existsById(id);
    }
    
    /**
     * Get critical pending results count
     */
    @Transactional(readOnly = true)
    public long getCriticalPendingCount() {
        return labResultRepository.countByStatusAndIsCritical(LabResultStatus.PENDING, true);
    }
    
    /**
     * Delete lab result (admin only)
     */
    public void deleteLabResult(Long id) {
        log.info("Deleting lab result with ID: {}", id);
        
        try {
            if (!labResultRepository.existsById(id)) {
                throw new RuntimeException("Lab result not found with ID: " + id);
            }
            
            labResultRepository.deleteById(id);
            log.info("Successfully deleted lab result with ID: {}", id);
            
        } catch (Exception e) {
            log.error("Error deleting lab result with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete lab result", e);
        }
    }
}
