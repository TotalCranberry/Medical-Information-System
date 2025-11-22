package com.mis.repository;

import com.mis.model.LabResult;
import com.mis.model.LabResultFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LabResultFileRepository extends JpaRepository<LabResultFile, String> {
    
    // NEW: Find a LabResultFile by LabResult (for download feature)
    Optional<LabResultFile> findByResult(LabResult result);
}




