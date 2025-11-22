package com.mis.dto.Prescription;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionCreateRequest {
    private String patientId;       // from frontend
    private String patientName;     // for display (encrypted)
    private String appointmentId;   // optional link
    private String generalNotes;    // text notes
    private List<PrescriptionItemRequest> medications;
    private String password;        // for authentication
}
