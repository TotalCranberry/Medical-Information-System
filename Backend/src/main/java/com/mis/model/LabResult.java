package com.mis.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "test_name")
    private String testName;
    
    @Column(columnDefinition = "TEXT")
    private String result;
    
    @Column(name = "reference_range")
    private String referenceRange;
    
    private String units;
    
    @Column(name = "is_critical")
    private Boolean isCritical;
    
    @Enumerated(EnumType.STRING)

    private LabResultStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // When the result was uploaded/completed
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    // Relationship to Patient (User entity)
    @ManyToOne(fetch = FetchType.LAZY)

    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    // Relationship to Lab Technician (User entity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    // NEW: Link back to the original test request
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_request_id")
    private LabTestRequest testRequest;
    
    // Enum for status
    public enum LabResultStatus {
        PENDING("Pending"),
        COMPLETED("Completed");
        
        private final String displayName;
        
        LabResultStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = LabResultStatus.PENDING;
        }
        if (isCritical == null) {
            isCritical = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (status == LabResultStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
    
    // Helper methods
    public boolean isCompleted() {
        return status == LabResultStatus.COMPLETED;
    }
    
    public boolean isCritical() {
        return isCritical != null && isCritical;
    }
    
    // Get urgency from the original request
    public String getUrgencyLevel() {
        return testRequest != null ? testRequest.getUrgencyLevel().getDisplayName() : "Unknown";
    }
    
    // Get requesting doctor from the original request
    public User getRequestingDoctor() {
        return testRequest != null ? testRequest.getRequestedBy() : null;
    }
}