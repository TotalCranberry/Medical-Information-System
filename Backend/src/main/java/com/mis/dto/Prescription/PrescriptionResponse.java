package com.mis.dto.Prescription;

import com.mis.model.User;
import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private String id;
    private String doctorId;
    private String doctorName;
    private String patientId;
    private String patientName;
    private User patient;
    private Integer patientAge;
    private String patientGender;
    private String appointmentId;
    private String generalNotes;
    private Date prescriptionDate;
    private Boolean isActive;
    private List<PrescriptionItemRequest> medications;
}
