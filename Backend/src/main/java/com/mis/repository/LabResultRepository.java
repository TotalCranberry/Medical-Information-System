package com.mis.repository;

import com.mis.model.LabResult;
import com.mis.model.LabResult.LabResultStatus;
import com.mis.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    // ========== Basic Finder Methods ==========
    
    /**
     * Find all lab results by status
     */
    List<LabResult> findByStatusOrderByCreatedAtDesc(LabResultStatus status);
    
    /**
     * Find all lab results for a specific patient
     */
    List<LabResult> findByPatientIdOrderByCreatedAtDesc(String patientId);
    
    /**
     * Find all lab results uploaded by a specific lab technician
     */
    List<LabResult> findByUploadedByIdOrderByCreatedAtDesc(String technicianId);
    
    /**
     * Find lab result by ID with patient and technician details
     */
    @Query("SELECT lr FROM LabResult lr " +
           "LEFT JOIN FETCH lr.patient " +
           "LEFT JOIN FETCH lr.uploadedBy " +
           "WHERE lr.id = :id")
    Optional<LabResult> findByIdWithDetails(@Param("id") Long id);

    // ========== Dashboard Statistics Methods ==========
    
    /**
     * Count lab results by status - for dashboard stats
     */
    long countByStatus(LabResultStatus status);
    
    /**
     * Count critical results that are pending
     */
    long countByStatusAndIsCritical(LabResultStatus status, Boolean isCritical);
    
    /**
     * Get all status counts in one query - optimized for dashboard
     */
    @Query("SELECT lr.status, COUNT(lr) FROM LabResult lr GROUP BY lr.status")
    List<Object[]> getStatusCounts();

    // ========== Date-based Queries ==========
    
    /**
     * Find results created today - for dashboard recent activity
     */
    @Query("SELECT lr FROM LabResult lr " +
           "WHERE DATE(lr.createdAt) = CURRENT_DATE " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findTodaysResults();
    
    /**
     * Find results created between date range
     */
    List<LabResult> findByCreatedAtBetweenOrderByCreatedAtDesc(
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    /**
     * Find recent results (last 7 days)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "WHERE lr.createdAt >= :weekAgo " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findRecentResults(@Param("weekAgo") LocalDateTime weekAgo);

    // ========== Search and Filter Methods ==========
    
    /**
     * Search by test name (for search functionality)
     */
    List<LabResult> findByTestNameContainingIgnoreCaseOrderByCreatedAtDesc(String testName);
    
    /**
     * Find by patient name (joining with User table)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "JOIN lr.patient p " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :patientName, '%')) " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findByPatientNameContaining(@Param("patientName") String patientName);
    
    /**
     * Find critical pending results - for urgent attention
     */
    List<LabResult> findByStatusAndIsCriticalOrderByCreatedAtAsc(
        LabResultStatus status, 
        Boolean isCritical
    );

    // ========== Complex Business Queries ==========
    
    /**
     * Find pending results for a specific patient (for doctor review)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "WHERE lr.patient.id = :patientId " +
           "AND lr.status = :status " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findPendingResultsForPatient(
        @Param("patientId") String patientId,
        @Param("status") LabResultStatus status
    );
    
    /**
     * Find results ready for review (completed but not sent to doctor)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "LEFT JOIN FETCH lr.patient " +
           "LEFT JOIN FETCH lr.uploadedBy " +
           "WHERE lr.status = 'COMPLETED' " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findResultsReadyForReview();
    
    /**
     * Get lab technician workload (count of results by technician)
     */
    @Query("SELECT lr.uploadedBy.name, COUNT(lr) FROM LabResult lr " +
           "WHERE lr.status = :status " +
           "GROUP BY lr.uploadedBy.id, lr.uploadedBy.name " +
           "ORDER BY COUNT(lr) DESC")
    List<Object[]> getTechnicianWorkload(@Param("status") LabResultStatus status);

    // ========== Specific Frontend Support Methods ==========
    
    /**
     * Get recent activity for dashboard (last 10 results)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "LEFT JOIN FETCH lr.patient " +
           "ORDER BY lr.createdAt DESC " +
           "LIMIT 10")
    List<LabResult> findRecentActivity();
    
    /**
     * Find results by multiple statuses (for complex filtering)
     */
    @Query("SELECT lr FROM LabResult lr " +
           "LEFT JOIN FETCH lr.patient " +
           "LEFT JOIN FETCH lr.uploadedBy " +
           "WHERE lr.status IN :statuses " +
           "ORDER BY lr.createdAt DESC")
    List<LabResult> findByStatusIn(@Param("statuses") List<LabResultStatus> statuses);
    
    /**
     * Check if patient has pending results
     */
    boolean existsByPatientIdAndStatus(String patientId, LabResultStatus status);

    List<LabResult> findByPatientOrderByCreatedAtDesc(User patient);
}