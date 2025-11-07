package com.mis.repository;

import com.mis.model.LabResult;
import com.mis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LabResultRepository extends JpaRepository<LabResult, String> {

    @Query("SELECT lr FROM LabResult lr WHERE lr.labRequest.patient = :patient ORDER BY lr.uploadedAt DESC")
    List<LabResult> findByPatientOrderByCreatedAtDesc(@Param("patient") User patient);
}
