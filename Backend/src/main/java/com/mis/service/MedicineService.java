package com.mis.service;

import com.mis.dto.MedicineDTO;
import com.mis.mapper.MedicineMapper;
import com.mis.model.Medicine;
import com.mis.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    // ✅ Get all medicines
    public List<MedicineDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(MedicineMapper::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Add or update medicine (based on name + manufacturer)
    public MedicineDTO addOrUpdateMedicine(MedicineDTO dto) {
        Optional<Medicine> existing = medicineRepository.findByNameAndManufacturer(dto.getName(), dto.getManufacturer());

        Medicine entity;
        if (existing.isPresent()) {
            // Update stock, mfg, expiry
            entity = existing.get();
            entity.setStock(dto.getStock());
            entity.setMfg(dto.getMfg());
            entity.setExpiry(dto.getExpiry());
        } else {
            // Add new medicine
            entity = MedicineMapper.toEntity(dto);
        }

        return MedicineMapper.toDto(medicineRepository.save(entity));
    }

    // ✅ Search by specific filter
    public List<MedicineDTO> search(String filter, String value) {
        List<Medicine> results;

        switch (filter.toLowerCase()) {
            case "name" -> results = medicineRepository.findByNameContainingIgnoreCase(value);
            case "generic" -> results = medicineRepository.findByGenericContainingIgnoreCase(value);
            case "manufacturer" -> results = medicineRepository.findByManufacturerContainingIgnoreCase(value);
            case "batch" -> results = medicineRepository.findByBatchContainingIgnoreCase(value);
            case "category" -> results = medicineRepository.findByCategoryContainingIgnoreCase(value);
            default -> throw new IllegalArgumentException("Invalid search filter");
        }

        return results.stream().map(MedicineMapper::toDto).collect(Collectors.toList());
    }

    // ✅ Delete medicine by ID
    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    // ✅ New: Find by Brand Name + Manufacturer
    public Optional<MedicineDTO> findByNameAndManufacturer(String name, String manufacturer) {
        return medicineRepository.findByNameAndManufacturer(name, manufacturer)
                .map(MedicineMapper::toDto);
    }
}
