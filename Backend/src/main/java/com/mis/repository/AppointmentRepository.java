package com.mis.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; // FIX: Changed from Student to User
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mis.model.Appointment;
import com.mis.model.User;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByPatientOrderByAppointmentDateTimeDesc(User patient);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime >= :startOfDay AND a.appointmentDateTime < :endOfDay ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findAppointmentsForDay(@Param("startOfDay") Date startOfDay, @Param("endOfDay") Date endOfDay);

    boolean existsByAppointmentDateTime(Date appointmentDateTime);
}
