package com.mis.repository;

import com.mis.model.DentalExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DentalExamRepository extends JpaRepository<DentalExam, Long> {
}