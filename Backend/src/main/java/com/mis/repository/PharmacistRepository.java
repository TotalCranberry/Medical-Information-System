package com.mis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Pharmacist;

public interface PharmacistRepository extends JpaRepository<Pharmacist, String> {
}
