package com.mis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.LabTechnician;

public interface LabTechnicianRepository extends JpaRepository<LabTechnician, String> {
}