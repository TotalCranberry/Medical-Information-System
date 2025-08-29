package com.mis.model.Prescription;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mis.model.enums.RouteOfAdministration;
import com.mis.model.enums.TimeOfDay;
import com.mis.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"prescription"})
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medicine_id")
    private String medicineId;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "medicine_name", length = 512)
    private String medicineName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "dosage", length = 512)
    private String dosage;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "times_per_day", length = 512)
    private String timesPerDay;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "duration_days", length = 512)
    private String durationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "route", nullable = false)
    private RouteOfAdministration route;

    @ElementCollection(targetClass = TimeOfDay.class)
    @CollectionTable(
        name = "prescription_item_times",
        joinColumns = @JoinColumn(name = "prescription_item_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "time_of_day", nullable = false)
    private List<TimeOfDay> timeOfDay;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
