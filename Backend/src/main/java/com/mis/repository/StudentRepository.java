package com.mis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Student;

public interface StudentRepository extends JpaRepository<Student, String> {
}
