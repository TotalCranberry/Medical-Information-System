package com.mis.controller;

import com.mis.dto.MedicineDTO;
import com.mis.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    // 🔐 Only Pharmacist can access
    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/all")
    public ResponseEntity<List<MedicineDTO>> getAll() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @PostMapping("/save")
    public ResponseEntity<MedicineDTO> save(@RequestBody MedicineDTO dto) {
        return ResponseEntity.ok(medicineService.addOrUpdateMedicine(dto));
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/search")
    public ResponseEntity<List<MedicineDTO>> search(
            @RequestParam("name") String value,
            @RequestParam(value = "field", defaultValue = "name") String field
    ) {
        return ResponseEntity.ok(medicineService.search(field, value));
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok("Medicine deleted successfully");
    }


    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/search/by-name-and-manufacturer")
    public ResponseEntity<MedicineDTO> findByNameAndManufacturer(
            @RequestParam String name,
            @RequestParam String manufacturer
    ) {
        return medicineService.findByNameAndManufacturer(name, manufacturer)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
