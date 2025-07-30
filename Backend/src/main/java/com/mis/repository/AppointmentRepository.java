package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Appointment;
import com.mis.model.Doctor;
import com.mis.model.Student;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(Student patient);
    List<Appointment> findByDoctor(Doctor doctor);
}