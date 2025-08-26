package com.mis.dto.prescription;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for medication timings
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimingDTO {
    private Boolean morning = false;
    private Boolean afternoon = false;
    private Boolean evening = false;
    private Boolean night = false;
}
