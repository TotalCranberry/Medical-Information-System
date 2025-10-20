package com.mis.controller;

import com.mis.dto.AnnouncementRequest;
import com.mis.model.Announcement;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import com.mis.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserRepository userRepository;

    @PostMapping("/admin/announcements")
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody AnnouncementRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        Announcement announcement = announcementService.createAnnouncement(request, user);
        return ResponseEntity.ok(announcement);
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        List<Announcement> announcements = announcementService.getAnnouncementsForUser(user);
        return ResponseEntity.ok(announcements);
    }

    @PostMapping("/announcements/{id}/acknowledge")
    public ResponseEntity<Void> acknowledgeAnnouncement(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        announcementService.acknowledgeAnnouncement(id, user);
        return ResponseEntity.ok().build();
    }
}