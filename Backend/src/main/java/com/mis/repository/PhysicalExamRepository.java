package com.mis.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.PhysicalExam;

@Repository
public interface PhysicalExamRepository extends JpaRepository<PhysicalExam, Long> {
    Optional<PhysicalExam> findByMedicalRecordId(Long medicalRecordId);
}