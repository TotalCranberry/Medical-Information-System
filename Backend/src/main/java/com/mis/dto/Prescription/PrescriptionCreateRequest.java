package com.mis.dto.prescription;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionCreateRequest {
    private String patientId;       // from frontend
    private String patientName;     // for display (encrypted)
    private String appointmentId;   // optional link
    private String generalNotes;    // text notes
    private List<PrescriptionItemRequest> medications;
}
