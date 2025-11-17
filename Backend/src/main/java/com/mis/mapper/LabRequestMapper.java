package com.mis.mapper;

import com.mis.dto.LabRequestDTO;
import com.mis.model.LabRequest;

import java.util.List;
import java.util.stream.Collectors;

public class LabRequestMapper {

    public static LabRequestDTO toDTO(LabRequest request) {
        LabRequestDTO dto = new LabRequestDTO();
        dto.setId(request.getId());
        dto.setPatientName(request.getPatient() != null ? request.getPatient().getName() : "Unknown");
        dto.setTestType(request.getTestType());
        dto.setOrderDate(request.getOrderDate());
        dto.setStatus(request.getStatus() != null ? request.getStatus().name() : "UNKNOWN");
        return dto;
    }

    public static List<LabRequestDTO> toDTOList(List<LabRequest> requests) {
        return requests.stream()
                .map(LabRequestMapper::toDTO)
                .collect(Collectors.toList());
    }
}
