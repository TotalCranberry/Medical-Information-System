package com.mis.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.DentalExam;
import com.mis.model.User;

@Repository
public interface DentalExamRepository extends JpaRepository<DentalExam, Long> {
    DentalExam findByMedicalRecordId(Long medicalRecordId);
}