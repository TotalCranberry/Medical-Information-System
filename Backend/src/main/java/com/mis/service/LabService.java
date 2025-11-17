package com.mis.service;

import com.mis.model.LabRequest;
import com.mis.model.LabResult;
import com.mis.repository.LabRequestRepository;
import com.mis.repository.LabResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LabService {

    private final LabRequestRepository labRequestRepository;
    private final LabResultRepository labResultRepository;

    public LabService(LabRequestRepository labRequestRepository, LabResultRepository labResultRepository) {
        this.labRequestRepository = labRequestRepository;
        this.labResultRepository = labResultRepository;
    }

    public List<LabRequest> getRequestsByStatus(LabRequest.Status status) {
        return labRequestRepository.findByStatus(status);
    }

    public LabRequest updateStatus(String requestId, String statusStr) {
        LabRequest request = labRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("LabRequest not found with ID: " + requestId));
        LabRequest.Status status;
        try {
            status = LabRequest.Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }
        request.setStatus(status);
        return labRequestRepository.save(request);
    }


    public LabResult uploadResult(String requestId, MultipartFile file) {
        LabRequest request = labRequestRepository.findById(requestId).orElseThrow();

        // Save file to server (simplified)
        String fileUrl = "/uploads/" + file.getOriginalFilename();

        LabResult result = new LabResult();
        result.setLabRequest(request);
        result.setFileName(file.getOriginalFilename());
        result.setFileUrl(fileUrl);
        result.setUploadedAt(LocalDateTime.now());

        request.setStatus(LabRequest.Status.COMPLETED);

        labRequestRepository.save(request);
        return labResultRepository.save(result);
    }

    public List<LabRequest> getAllRequests() {
        return labRequestRepository.findAll();
    }
}
