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

    // NEW: DB row id of the prescription_items entry
    private Long id;

    private String medicineId;
    private String medicineName;
    private String dosage;
    private String timesPerDay;
    private String durationDays;

    @NotNull
    private RouteOfAdministration route;

    @NotEmpty
    private List<TimeOfDay> timeOfDay;

    private String instructions;
    private String form;
    private String strength;

    // NEW: reflect/update item-level quantities & status
    private Integer requiredQuantity;     // requested/needed quantity
    private Integer dispensedQuantity;    // actually dispensed quantity
    private Integer dispensedStatus;      // 1 = dispensed (qty > 0), 0 = not yet
}
