package com.mis.repository;

import java.util.Date;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mis.model.Appointment;
import com.mis.model.AppointmentStatus;
import com.mis.model.User;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByPatientOrderByAppointmentDateTimeDesc(User patient);

    List<Appointment> findByPatientAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(User patient, Date date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime >= :startOfDay AND a.appointmentDateTime < :endOfDay ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findAppointmentsForDay(@Param("startOfDay") Date startOfDay, @Param("endOfDay") Date endOfDay);

    boolean existsByAppointmentDateTime(Date appointmentDateTime);
    
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.appointmentDateTime = :appointmentDateTime AND a.status != :status")
    boolean existsByAppointmentDateTimeAndStatusNot(@Param("appointmentDateTime") Date appointmentDateTime, @Param("status") AppointmentStatus status);

    List<Appointment> findByStatusOrderByAppointmentDateTimeAsc(AppointmentStatus status);
    
    List<Appointment> findAllByOrderByAppointmentDateTimeDesc();
    
    long countByStatus(AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.appointmentDateTime >= :startOfDay AND a.appointmentDateTime < :endOfDay ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findByStatusAndDateRange(@Param("status") AppointmentStatus status,
                                             @Param("startOfDay") Date startOfDay,
                                             @Param("endOfDay") Date endOfDay);

    @Query("SELECT a FROM Appointment a WHERE CAST(a.appointmentDateTime AS LocalDate) = :date")
    List<Appointment> findByAppointmentDate(@Param("date") LocalDate date);
}