package com.mis.configuration;

import com.mis.service.AppointmentReminderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    private final AppointmentReminderService appointmentReminderService;

    public ScheduledTasks(AppointmentReminderService appointmentReminderService) {
        this.appointmentReminderService = appointmentReminderService;
    }

    @Scheduled(cron = "0 0 5 * * ?") // Run every day at 5 AM
    public void sendAppointmentReminders() {
        appointmentReminderService.sendAppointmentReminders();
    }
}