package com.mis.repository;

import com.mis.model.PhysicalExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhysicalExamRepository extends JpaRepository<PhysicalExam, Long> {
}