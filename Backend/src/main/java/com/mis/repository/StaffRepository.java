package com.mis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mis.model.Staff;

public interface StaffRepository extends JpaRepository<Staff, String> {
}
