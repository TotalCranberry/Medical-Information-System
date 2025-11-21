package com.mis.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.DentalExam;

@Repository
public interface DentalExamRepository extends JpaRepository<DentalExam, Long> {
    Optional<DentalExam> findByMedicalRecordId(Long medicalRecordId);
}