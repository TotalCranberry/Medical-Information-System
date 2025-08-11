package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.Medical;
import com.mis.model.User;

@Repository
public interface MedicalRepository extends JpaRepository<Medical, String> {
    
    List<Medical> findByPatientOrderByMedicalDateDesc(User patient);
    
    List<Medical> findByDoctorIdOrderByMedicalDateDesc(String doctorId);
    
    List<Medical> findByPatientAndDoctorIdOrderByMedicalDateDesc(User patient, String doctorId);
    
    List<Medical> findByIsSentToCourseUnitOrderByMedicalDateDesc(Boolean isSentToCourseUnit);
    
    List<Medical> findByPatientIdAndIsSentToCourseUnit(String patientId, Boolean isSentToCourseUnit);
}