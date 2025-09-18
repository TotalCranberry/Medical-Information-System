package com.mis.service;

import com.mis.dto.AnnouncementRequest;
import com.mis.model.Announcement;
import com.mis.model.Role;
import com.mis.model.User;
import com.mis.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(AnnouncementRequest request, User author) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .authorName(author.getName())
                .createdAt(LocalDateTime.now())
                .targetRole(request.getTargetRole())
                .build();
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAnnouncementsForUser(User user) {
        Announcement.TargetRole userRole;
        if (user.getRole() == Role.Student || user.getRole() == Role.Staff) {
            userRole = Announcement.TargetRole.PATIENT;
        } else {
            userRole = Announcement.TargetRole.valueOf(user.getRole().name().toUpperCase());
        }
        List<Announcement> announcements = announcementRepository.findByTargetRoleOrTargetRole(userRole, Announcement.TargetRole.ALL);
        announcements.removeIf(announcement -> announcement.getAcknowledgedBy().contains(user));
        return announcements;
    }

    public void acknowledgeAnnouncement(Long announcementId, User user) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.getAcknowledgedBy().add(user);
        announcementRepository.save(announcement);
    }
}