package com.mis.repository;

import com.mis.model.LabRequest;
import com.mis.model.LabResult;
import com.mis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LabResultRepository extends JpaRepository<LabResult, String> {

    // Query to find lab results by patient, ordered by upload date (newest first)
    @Query("SELECT lr FROM LabResult lr WHERE lr.labRequest.patient = :patient ORDER BY lr.uploadedAt DESC")
    List<LabResult> findByPatientOrderByCreatedAtDesc(@Param("patient") User patient);

    // NEW: Find a single LabResult by LabRequest (for download feature)
    Optional<LabResult> findByLabRequest(LabRequest labRequest);
}
