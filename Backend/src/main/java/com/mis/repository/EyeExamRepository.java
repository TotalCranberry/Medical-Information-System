package com.mis.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.EyeExam;

@Repository
public interface EyeExamRepository extends JpaRepository<EyeExam, Long> {
    Optional<EyeExam> findByMedicalRecordId(Long medicalRecordId);
}