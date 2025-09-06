
package com.mis.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_test_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "test_name")
    private String testName;
    
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @Column(name = "urgency_level")
    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgencyLevel;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    // Relationship to Doctor (User entity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy; // Doctor who requested the test
    
    // Relationship to Patient (User entity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    // Optional: Link to appointment if test was requested during appointment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    // Optional: Link to diagnosis if test was requested after diagnosis
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosis_id")
    private Diagnosis diagnosis;
    
    // Link to actual lab result (once technician processes it)
    @OneToOne(mappedBy = "testRequest", cascade = CascadeType.ALL)
    private LabResult labResult;
    
    // Enums
    public enum UrgencyLevel {
        ROUTINE("Routine"),
        URGENT("Urgent"),
        STAT("STAT"); // Immediate/Emergency
        
        private final String displayName;
        
        UrgencyLevel(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum RequestStatus {
        PENDING("Pending"), // Doctor submitted, waiting for lab to pick up
        ACCEPTED("Accepted"), // Lab technician accepted the request
        IN_PROGRESS("In Progress"), // Lab technician is working on it
        COMPLETED("Completed"), // Results uploaded and ready
        DECLINED("Declined"), // Lab declined the request (insufficient info, etc.)
        CANCELLED("Cancelled"); // Doctor cancelled the request
        
        private final String displayName;
        
        RequestStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = RequestStatus.PENDING;
        }
        if (urgencyLevel == null) {
            urgencyLevel = UrgencyLevel.ROUTINE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        // You can add update logic here if needed
    }
    
    // Helper methods
    public boolean isPending() {
        return status == RequestStatus.PENDING;
    }
    
    public boolean isCompleted() {
        return status == RequestStatus.COMPLETED;
    }
    
    public boolean isUrgent() {
        return urgencyLevel == UrgencyLevel.URGENT || urgencyLevel == UrgencyLevel.STAT;
    }
}
