package com.mis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetRole targetRole;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "announcement_acknowledgement",
            joinColumns = @JoinColumn(name = "announcement_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> acknowledgedBy = new HashSet<>();

    public Set<User> getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public enum TargetRole {
        ALL,
        PATIENT,
        DOCTOR,
        STAFF,
        STUDENT,
        PHARMACIST,
        LABTECHNICIAN
    }
}