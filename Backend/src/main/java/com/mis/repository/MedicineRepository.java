package com.mis.repository;

import com.mis.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByNameAndManufacturer(String name, String manufacturer);

    List<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByGenericContainingIgnoreCase(String generic);
    List<Medicine> findByManufacturerContainingIgnoreCase(String manufacturer);
    List<Medicine> findByBatchContainingIgnoreCase(String batch);
    List<Medicine> findByCategoryContainingIgnoreCase(String category);
}
