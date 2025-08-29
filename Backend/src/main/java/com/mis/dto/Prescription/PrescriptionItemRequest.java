package com.mis.dto.prescription;

import com.mis.model.enums.RouteOfAdministration;
import com.mis.model.enums.TimeOfDay;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemRequest {
    private String medicineId;
    private String medicineName;
    private String dosage;
    private String timesPerDay;
    private String durationDays;
    @NotNull private RouteOfAdministration route;
    @NotEmpty private List<TimeOfDay> timeOfDay;
    private String instructions;
}
