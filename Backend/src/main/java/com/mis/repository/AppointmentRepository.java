package com.mis.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.User;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByPatientOrderByAppointmentDateTimeDesc(User patient);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime >= :startOfDay AND a.appointmentDateTime < :endOfDay ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findAppointmentsForDay(@Param("startOfDay") Date startOfDay, @Param("endOfDay") Date endOfDay);

    boolean existsByAppointmentDateTime(Date appointmentDateTime);
    
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.appointmentDateTime = :appointmentDateTime AND a.status != :status")
    boolean existsByAppointmentDateTimeAndStatusNot(@Param("appointmentDateTime") Date appointmentDateTime, @Param("status") AppointmentStatus status);

    List<Appointment> findByStatusOrderByAppointmentDateTimeAsc(AppointmentStatus status);
    
    // FIXED: Corrected typo in method name
    List<Appointment> findAllByOrderByAppointmentDateTimeDesc();
    
    long countByStatus(AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.appointmentDateTime >= :startOfDay AND a.appointmentDateTime < :endOfDay ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findByStatusAndDateRange(@Param("status") AppointmentStatus status, 
                                             @Param("startOfDay") Date startOfDay, 
                                             @Param("endOfDay") Date endOfDay);
}