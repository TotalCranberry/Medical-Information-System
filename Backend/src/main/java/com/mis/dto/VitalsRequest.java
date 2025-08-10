package com.mis.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class VitalsRequest {

    @DecimalMin(value = "50.0", message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height must be less than 300 cm")
    private Double heightCm;

    @DecimalMin(value = "10.0", message = "Weight must be at least 10 kg")
    @DecimalMax(value = "500.0", message = "Weight must be less than 500 kg")
    private Double weightKg;

    @DecimalMin(value = "30.0", message = "Temperature must be at least 30°C")
    @DecimalMax(value = "50.0", message = "Temperature must be less than 50°C")
    private Double temperatureC;

    @Min(value = 60, message = "Systolic BP must be at least 60")
    @Max(value = 300, message = "Systolic BP must be less than 300")
    private Integer systolicBp;

    @Min(value = 40, message = "Diastolic BP must be at least 40")
    @Max(value = 200, message = "Diastolic BP must be less than 200")
    private Integer diastolicBp;

    @Min(value = 30, message = "Heart rate must be at least 30")
    @Max(value = 250, message = "Heart rate must be less than 250")
    private Integer heartRate;

    @Min(value = 5, message = "Respiratory rate must be at least 5")
    @Max(value = 60, message = "Respiratory rate must be less than 60")
    private Integer respiratoryRate;

    @Min(value = 50, message = "Oxygen saturation must be at least 50%")
    @Max(value = 100, message = "Oxygen saturation must be less than 100%")
    private Integer oxygenSaturation;

    private String notes;

    // Default constructor
    public VitalsRequest() {
    }

    // Getters and Setters
    public Double getHeightCm() { 
        return heightCm; 
    }
    
    public void setHeightCm(Double heightCm) { 
        this.heightCm = heightCm; 
    }

    public Double getWeightKg() { 
        return weightKg; 
    }
    
    public void setWeightKg(Double weightKg) { 
        this.weightKg = weightKg; 
    }

    public Double getTemperatureC() { 
        return temperatureC; 
    }
    
    public void setTemperatureC(Double temperatureC) { 
        this.temperatureC = temperatureC; 
    }

    public Integer getSystolicBp() { 
        return systolicBp; 
    }
    
    public void setSystolicBp(Integer systolicBp) { 
        this.systolicBp = systolicBp; 
    }

    public Integer getDiastolicBp() { 
        return diastolicBp; 
    }
    
    public void setDiastolicBp(Integer diastolicBp) { 
        this.diastolicBp = diastolicBp; 
    }

    public Integer getHeartRate() { 
        return heartRate; 
    }
    
    public void setHeartRate(Integer heartRate) { 
        this.heartRate = heartRate; 
    }

    public Integer getRespiratoryRate() { 
        return respiratoryRate; 
    }
    
    public void setRespiratoryRate(Integer respiratoryRate) { 
        this.respiratoryRate = respiratoryRate; 
    }

    public Integer getOxygenSaturation() { 
        return oxygenSaturation; 
    }
    
    public void setOxygenSaturation(Integer oxygenSaturation) { 
        this.oxygenSaturation = oxygenSaturation; 
    }

    public String getNotes() { 
        return notes; 
    }
    
    public void setNotes(String notes) { 
        this.notes = notes; 
    }
}