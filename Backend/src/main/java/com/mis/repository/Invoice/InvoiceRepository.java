package com.mis.repository.Invoice;

import com.mis.model.Invoice.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findTopByPrescription_IdOrderByCreatedAtDesc(String prescriptionId);
}