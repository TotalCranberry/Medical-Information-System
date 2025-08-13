package com.mis.repository;

import com.mis.model.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {


    List<Prescription> findByPatientIdAndIsActiveTrueOrderByRequestDateDesc(String patientId);


    List<Prescription> findByDoctorIdAndIsActiveTrueOrderByRequestDateDesc(String doctorId);


    List<Prescription> findByStatusAndIsActiveTrueOrderByRequestDateDesc(Prescription.PrescriptionStatus status);


    Page<Prescription> findByStatusAndIsActiveTrue(Prescription.PrescriptionStatus status, Pageable pageable);


    List<Prescription> findByPatientIdAndDoctorIdAndIsActiveTrueOrderByRequestDateDesc(String patientId, String doctorId);


    Optional<Prescription> findByAppointmentIdAndIsActiveTrue(String appointmentId);


    @Query("SELECT p FROM Prescription p WHERE p.requestDate BETWEEN :startDate AND :endDate AND p.isActive = true ORDER BY p.requestDate DESC")
    List<Prescription> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);


    @Query("SELECT p FROM Prescription p WHERE p.doctorId = :doctorId AND p.requestDate >= :since AND p.isActive = true ORDER BY p.requestDate DESC")
    List<Prescription> findRecentPrescriptionsByDoctor(@Param("doctorId") String doctorId, @Param("since") LocalDateTime since);


    @Query("SELECT p FROM Prescription p WHERE p.patientId = :patientId AND p.requestDate >= :since AND p.isActive = true ORDER BY p.requestDate DESC")
    List<Prescription> findRecentPrescriptionsByPatient(@Param("patientId") String patientId, @Param("since") LocalDateTime since);


    Long countByStatusAndIsActiveTrue(Prescription.PrescriptionStatus status);


    Long countByDoctorIdAndStatusAndIsActiveTrue(String doctorId, Prescription.PrescriptionStatus status);


    @Query("SELECT p FROM Prescription p WHERE p.status IN ('REQUESTED', 'PENDING') AND p.isActive = true ORDER BY p.requestDate ASC")
    List<Prescription> findPrescriptionsForPharmacist();


    List<Prescription> findByPharmacistIdAndIsActiveTrueOrderByLastUpdatedDesc(String pharmacistId);


    @Query("SELECT p FROM Prescription p WHERE p.status = 'REQUESTED' AND p.requestDate < :overdueDate AND p.isActive = true ORDER BY p.requestDate ASC")
    List<Prescription> findOverduePrescriptions(@Param("overdueDate") LocalDateTime overdueDate);


    @Query("SELECT p FROM Prescription p WHERE p.status IN :statuses AND p.isActive = true ORDER BY p.requestDate DESC")
    List<Prescription> findByStatusIn(@Param("statuses") List<Prescription.PrescriptionStatus> statuses);


    @Query("SELECT p FROM Prescription p WHERE LOWER(p.patientName) LIKE LOWER(CONCAT('%', :patientName, '%')) AND p.isActive = true ORDER BY p.requestDate DESC")
    List<Prescription> findByPatientNameContainingIgnoreCase(@Param("patientName") String patientName);


    @Query("SELECT " +
            "COUNT(CASE WHEN p.status = 'REQUESTED' THEN 1 END) as requested, " +
            "COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending, " +
            "COUNT(CASE WHEN p.status = 'IN_PROGRESS' THEN 1 END) as inProgress, " +
            "COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed " +
            "FROM Prescription p WHERE p.isActive = true")
    Object[] getPrescriptionStatistics();


    @Query("SELECT " +
            "COUNT(CASE WHEN p.status = 'REQUESTED' THEN 1 END) as requested, " +
            "COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending, " +
            "COUNT(CASE WHEN p.status = 'IN_PROGRESS' THEN 1 END) as inProgress, " +
            "COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed " +
            "FROM Prescription p WHERE p.doctorId = :doctorId AND p.isActive = true")
    Object[] getDoctorPrescriptionStatistics(@Param("doctorId") String doctorId);

    List<Prescription> findByPatient(User patient);
}

