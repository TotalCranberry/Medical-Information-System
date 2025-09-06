package com.mis.service.Invoice;

import com.mis.model.Invoice.Invoice;
import com.mis.model.Invoice.InvoiceItem;
import com.mis.model.Medicine.Medicine;
import com.mis.model.Prescription.Prescription;
import com.mis.model.Prescription.PrescriptionItem;
import com.mis.repository.Invoice.InvoiceRepository;
import com.mis.repository.Medicine.MedicineRepository;
import com.mis.repository.Prescription.PrescriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, PrescriptionRepository prescriptionRepository, MedicineRepository medicineRepository) {
        this.invoiceRepository = invoiceRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineRepository = medicineRepository;
    }

    public Invoice generateInvoice(String prescriptionId) {
        logger.info("Generating invoice for prescription: {}", prescriptionId);
        
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        Invoice invoice = new Invoice();
        invoice.setPrescription(prescription);
        invoice.setPatient(prescription.getPatient());
        invoice.setCreatedAt(LocalDateTime.now());

        List<InvoiceItem> invoiceItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (PrescriptionItem prescriptionItem : prescription.getPrescriptionItems()) {
            if (prescriptionItem.getDispensedStatus() != null && prescriptionItem.getDispensedStatus() == 1) {
                Integer dispenseQty = prescriptionItem.getDispenseQuantity();
                if (dispenseQty == null || dispenseQty <= 0) {
                    logger.warn("Skipping invoice item for {}: invalid dispense quantity {}", prescriptionItem.getMedicineName(), dispenseQty);
                    continue;
                }

                // Use fuzzy search since prescription medicine names might be encrypted
                List<Medicine> candidates = medicineRepository.findByNameContainingIgnoreCase(prescriptionItem.getMedicineName());
                if (candidates.isEmpty()) {
                    logger.warn("No medicine found for: {}", prescriptionItem.getMedicineName());
                    continue; // Skip this item instead of failing
                }
                Medicine medicine = candidates.get(0); // Take the first match

                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(invoice);
                invoiceItem.setMedicineName(prescriptionItem.getMedicineName());
                invoiceItem.setDosage(prescriptionItem.getDosage());
                invoiceItem.setDispenseQuantity(dispenseQty);
                invoiceItem.setUnitPrice(Double.valueOf(medicine.getUnitPrice()));
                double itemTotal = dispenseQty * medicine.getUnitPrice();
                invoiceItem.setTotalPrice(itemTotal);
                invoiceItems.add(invoiceItem);
                totalAmount += itemTotal;
            }
        }

        invoice.setInvoiceItems(invoiceItems);
        invoice.setTotalAmount(totalAmount);

        Invoice saved = invoiceRepository.save(invoice);
        logger.info("Successfully generated invoice with ID: {} for prescription: {}", saved.getId(), prescriptionId);
        return saved;
    }

    public Invoice getInvoiceByPrescriptionId(String prescriptionId) {
        logger.info("Looking for invoice by prescription ID: {}", prescriptionId);
        try {
            Invoice invoice = invoiceRepository.findTopByPrescription_IdOrderByCreatedAtDesc(prescriptionId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found for prescription: " + prescriptionId));
            logger.info("Found invoice with ID: {} for prescription: {}", invoice.getId(), prescriptionId);
            return invoice;
        } catch (Exception e) {
            logger.error("Error retrieving invoice for prescription {}: {}", prescriptionId, e.getMessage(), e);
            throw e;
        }
    }
}