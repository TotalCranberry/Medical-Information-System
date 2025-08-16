package com.mis.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResultStatsDTO {
    
    private long newRequests;     // PENDING status count
    private long inProgress;      // Being processed count
    private long completed;       // COMPLETED status count
    private long pending;         // Awaiting review count
    private long criticalPending; // Critical + pending count
    private long totalToday;      // Today's total count
    
    // Additional stats for detailed dashboard
    private long totalThisWeek;
    private long totalThisMonth;
}