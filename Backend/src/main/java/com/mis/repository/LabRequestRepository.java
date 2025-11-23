package com.mis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.LabRequest;
import com.mis.model.User;

public interface LabRequestRepository extends JpaRepository<LabRequest, String> {
    List<LabRequest> findByStatus(LabRequest.Status status);
    List<LabRequest> findByPatient(com.mis.model.User patient);
    List<LabRequest> findByPatientOrderByOrderDateDesc(com.mis.model.User patient);
}
