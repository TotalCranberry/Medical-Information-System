package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.LabResult;
import com.mis.model.LabTechnician;
import com.mis.model.Student;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findByPatient(Student patient);
    List<LabResult> findByUploadedBy(LabTechnician technician);
}
