package com.mis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, String> {
}
