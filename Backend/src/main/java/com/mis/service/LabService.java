package com.mis.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mis.model.LabRequest;
import com.mis.model.LabResult;
import com.mis.model.LabResultFile;
import com.mis.model.User;
import com.mis.repository.LabRequestRepository;
import com.mis.repository.LabResultRepository;
import com.mis.repository.LabResultFileRepository;
import com.mis.repository.UserRepository;
import java.util.UUID;


@Service
public class LabService {

    private final LabRequestRepository labRequestRepository;
    private final LabResultRepository labResultRepository;
    private final NotificationService notificationService;
    private final LabResultFileRepository labResultFileRepository;
    private final UserRepository userRepository;


    public LabService(
            LabRequestRepository labRequestRepository,
            LabResultRepository labResultRepository,
            NotificationService notificationService,
            LabResultFileRepository labResultFileRepository,
            UserRepository userRepository
    ) {
        this.labRequestRepository = labRequestRepository;
        this.labResultRepository = labResultRepository;
        this.notificationService = notificationService;
        this.labResultFileRepository = labResultFileRepository;
        this.userRepository = userRepository;
    }

    // Create a new lab request
    public LabRequest createLabRequest(String patientId, String testType) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        LabRequest labRequest = new LabRequest();
        labRequest.setPatient(patient);
        labRequest.setTestType(testType);
        labRequest.setOrderDate(LocalDateTime.now());
        labRequest.setStatus(LabRequest.Status.PENDING);

        return labRequestRepository.save(labRequest);
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

        // Check if status is COMPLETED and send notification
        if (status == LabRequest.Status.COMPLETED) {
            String message = "Your lab request for " + request.getTestType() + " has been completed.";
            
            notificationService.createNotification(request.getPatient(), message);
        }
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

    // Get Lab Requests for a specific patient
    public List<LabRequest> getLabRequestsForPatient(String patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
        return labRequestRepository.findByPatient(patient);
    }

    // Get a single lab request by ID
    public LabRequest getLabRequestById(String requestId) {
        return labRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("LabRequest not found with ID: " + requestId));
    }

    // ----------------------------
    // NEW: Get Lab Result File for Download
    // ----------------------------
    public LabResultFile getLabResultFile(String requestId) {
        // 1. Find the LabRequest
        LabRequest request = labRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("LabRequest not found with ID: " + requestId));
        
        // 2. Find the LabResult associated with this request
        LabResult result = labResultRepository.findByLabRequest(request)
                .orElseThrow(() -> new RuntimeException("No result found for request ID: " + requestId));
        
        // 3. Find the file associated with this result
        LabResultFile resultFile = labResultFileRepository.findByResult(result)
                .orElseThrow(() -> new RuntimeException("No file found for result ID: " + result.getId()));
        
        return resultFile;
    }
}
