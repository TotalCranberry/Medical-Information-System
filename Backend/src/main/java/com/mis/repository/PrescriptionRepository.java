package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Doctor;
import com.mis.model.Prescription;
import com.mis.model.User;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient(User patient);
    List<Prescription> findByDoctor(Doctor doctor);
    List<Prescription> findByPatientOrderByCreatedAtDesc(User patient);
}
