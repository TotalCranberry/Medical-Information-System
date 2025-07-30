package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Doctor;
import com.mis.model.Prescription;
import com.mis.model.Student;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient(Student student);
    List<Prescription> findByDoctor(Doctor doctor);
}
