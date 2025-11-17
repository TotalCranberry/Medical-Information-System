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

    @Scheduled(cron = "0 0 8 * * ?") // Run every day at 8 AM
    public void sendAppointmentReminders() {
        appointmentReminderService.sendAppointmentReminders();
    }
}