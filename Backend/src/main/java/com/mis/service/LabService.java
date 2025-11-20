package com.mis.service;

import com.mis.model.LabRequest;
import com.mis.model.LabResult;
import com.mis.model.LabResultFile;
import com.mis.repository.LabRequestRepository;
import com.mis.repository.LabResultRepository;
import com.mis.repository.LabResultFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LabService {

    private final LabRequestRepository labRequestRepository;
    private final LabResultRepository labResultRepository;
    private final LabResultFileRepository labResultFileRepository;

    public LabService(
            LabRequestRepository labRequestRepository,
            LabResultRepository labResultRepository,
            LabResultFileRepository labResultFileRepository
    ) {
        this.labRequestRepository = labRequestRepository;
        this.labResultRepository = labResultRepository;
        this.labResultFileRepository = labResultFileRepository;
    }

    // Get Requests by Status
    public List<LabRequest> getRequestsByStatus(LabRequest.Status status) {
        return labRequestRepository.findByStatus(status);
    }

    // Update Lab Request Status
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

    // Upload Lab Result + Store PDF inside Database as BLOB
    public LabResult uploadResult(String requestId, MultipartFile file) {
        LabRequest request = labRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("LabRequest not found"));

        // --- 1. Save LabResult ---
        LabResult result = new LabResult();
        result.setLabRequest(request);
        result.setFileName(file.getOriginalFilename());
        result.setUploadedAt(LocalDateTime.now());

        LabResult savedResult = labResultRepository.save(result);

        // --- 2. Save File as BLOB in lab_result_files table ---
        try {
            LabResultFile resultFile = new LabResultFile();
            resultFile.setId(UUID.randomUUID().toString());
            resultFile.setResult(savedResult);
            resultFile.setFileName(file.getOriginalFilename());
            resultFile.setFileData(file.getBytes());
            resultFile.setUploadedAt(LocalDateTime.now());

            labResultFileRepository.save(resultFile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save PDF file into database", e);
        }

        // --- 3. Update Request Status ---
        request.setStatus(LabRequest.Status.COMPLETED);
        labRequestRepository.save(request);

        return savedResult;
    }

    // Get All Requests
    public List<LabRequest> getAllRequests() {
        return labRequestRepository.findAll();
    }
}
