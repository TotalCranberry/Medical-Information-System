package com.mis.service;

import com.mis.model.Appointment;
import com.mis.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentReminderService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public AppointmentReminderService(AppointmentRepository appointmentRepository, NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    public void sendAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> appointments = appointmentRepository.findByAppointmentDate(tomorrow);

        for (Appointment appointment : appointments) {
            String message = "Reminder: You have an appointment tomorrow at " + appointment.getAppointmentDateTime().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalTime();
            notificationService.createNotification(appointment.getPatient(), message);
        }
    }
}