package com.mis.repository;

import com.mis.model.EyeExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EyeExamRepository extends JpaRepository<EyeExam, Long> {
}