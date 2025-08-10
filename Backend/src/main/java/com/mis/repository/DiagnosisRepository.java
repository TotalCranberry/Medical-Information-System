package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Diagnosis;
import com.mis.model.User;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, String> {
    
    List<Diagnosis> findByPatientOrderByDiagnosisDateDesc(User patient);
    
    List<Diagnosis> findByPatientAndDoctorIdOrderByDiagnosisDateDesc(User patient, String doctorId);
    
    List<Diagnosis> findByDoctorIdOrderByDiagnosisDateDesc(String doctorId);
}