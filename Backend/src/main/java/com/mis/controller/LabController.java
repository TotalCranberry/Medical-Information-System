package com.mis.controller;

import com.mis.dto.LabRequestDTO;
import com.mis.mapper.LabRequestMapper;
import com.mis.model.LabRequest;
import com.mis.model.LabResult;
import com.mis.model.LabResultFile;
import com.mis.service.LabService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lab")
@CrossOrigin(origins = "http://localhost:3000")
public class LabController {

    private final LabService labService;

    public LabController(LabService labService) {
        this.labService = labService;
    }

    // ----------------------------
    // CREATE new lab request
    // ----------------------------
    @PostMapping("/requests")
    public ResponseEntity<LabRequestDTO> createLabRequest(@RequestBody Map<String, String> request) {
        String patientId = request.get("patientId");
        String testType = request.get("testType");

        if (patientId == null || patientId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (testType == null || testType.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        LabRequest labRequest = labService.createLabRequest(patientId, testType);
        LabRequestDTO dto = LabRequestMapper.toDTO(labRequest);
        return ResponseEntity.ok(dto);
    }

    // ----------------------------
    // GET all requests
    // ----------------------------
    @GetMapping("/requests")
    public ResponseEntity<List<LabRequestDTO>> getAllRequests() {
        List<LabRequest> requests = labService.getAllRequests();
        return ResponseEntity.ok(LabRequestMapper.toDTOList(requests));
    }

    // ----------------------------
    // GET requests by status
    // ----------------------------
    @GetMapping("/requests/status/{status}")
    public ResponseEntity<List<LabRequestDTO>> getRequestsByStatus(@PathVariable String status) {
        List<LabRequest> requests = labService.getRequestsByStatus(LabRequest.Status.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(LabRequestMapper.toDTOList(requests));
    }

    // ----------------------------
    // GET requests by patient
    // ----------------------------
    @GetMapping("/requests/patient/{patientId}")
    public ResponseEntity<List<LabRequestDTO>> getRequestsByPatient(@PathVariable String patientId) {
        List<LabRequest> requests = labService.getLabRequestsForPatient(patientId);
        return ResponseEntity.ok(LabRequestMapper.toDTOList(requests));
    }

    // ----------------------------
    // GET single request by ID
    // ----------------------------
    @GetMapping("/requests/{id}")
    public ResponseEntity<LabRequestDTO> getRequestById(@PathVariable String id) {
        LabRequest request = labService.getLabRequestById(id);
        LabRequestDTO dto = LabRequestMapper.toDTO(request);
        return ResponseEntity.ok(dto);
    }

    // ----------------------------
    // UPDATE request status
    // ----------------------------
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<LabRequestDTO> updateStatus(@PathVariable String id, @RequestParam String status) {
        LabRequest updated = labService.updateStatus(id, status);
        LabRequestDTO dto = LabRequestMapper.toDTO(updated);
        return ResponseEntity.ok(dto);
    }

    // ----------------------------
    // UPLOAD lab result PDF
    // ----------------------------
    @PostMapping("/requests/{id}/upload")
    public ResponseEntity<LabResult> uploadResult(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        LabResult result = labService.uploadResult(id, file);
        return ResponseEntity.ok(result);
    }

    // ----------------------------
    // DOWNLOAD lab result PDF
    // ----------------------------
    @GetMapping("/requests/{requestId}/download")
    public ResponseEntity<byte[]> downloadLabResult(@PathVariable String requestId) {
        try {
            LabResultFile resultFile = labService.getLabResultFile(requestId);
            
            if (resultFile == null) {
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", resultFile.getFileName());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resultFile.getFileData());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}