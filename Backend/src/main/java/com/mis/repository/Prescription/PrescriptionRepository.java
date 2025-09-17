package com.mis.repository.Prescription;

import java.util.List;
import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mis.model.Prescription.Prescription;
import com.mis.model.User;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {

    List<Prescription> findByPatient(User patient);

    List<Prescription> findByPatientOrderByPrescriptionDateDesc(User patient);

    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(String doctorId);

    List<Prescription> findByPatientAndDoctorIdOrderByPrescriptionDateDesc(User patient, String doctorId);

    List<Prescription> findByIsActiveOrderByPrescriptionDateDesc(Boolean isActive);

    List<Prescription> findByPatientAndIsActive(User patient, Boolean isActive);
    List<Prescription> findByIsActiveAndUpdatedAt(Boolean isActive, Date updatedAt);
    List<Prescription> findByIsActiveAndUpdatedAtBetween(Boolean isActive, Date startDate, Date endDate);
}