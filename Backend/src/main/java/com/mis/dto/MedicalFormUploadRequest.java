package com.mis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MedicalFormUploadRequest {
    private String base64Image;
}