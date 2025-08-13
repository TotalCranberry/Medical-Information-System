package com.mis.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mis.model.User;
import com.mis.model.Vitals;

public interface VitalsRepository extends JpaRepository<Vitals, String> {
    
    List<Vitals> findByPatientOrderByRecordedAtDesc(User patient);
    
    @Query("SELECT v FROM Vitals v WHERE v.patient = :patient ORDER BY v.recordedAt DESC")
    Optional<Vitals> findLatestVitalsByPatient(@Param("patient") User patient);
    
    List<Vitals> findByPatientAndRecordedByOrderByRecordedAtDesc(User patient, String recordedBy);
}