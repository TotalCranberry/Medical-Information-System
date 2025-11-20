package com.mis.repository;

import com.mis.model.LabRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabRequestRepository extends JpaRepository<LabRequest, String> {
    List<LabRequest> findByStatus(LabRequest.Status status);
    List<LabRequest> findByPatient(com.mis.model.User patient);
}
