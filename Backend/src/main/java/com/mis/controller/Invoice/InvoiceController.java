package com.mis.controller.Invoice;

import com.mis.dto.Invoice.InvoiceDto;
import com.mis.dto.Invoice.InvoiceItemDto;
import com.mis.model.Invoice.Invoice;
import com.mis.service.Invoice.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate/{prescriptionId}")
    public ResponseEntity<Invoice> generateInvoice(@PathVariable String prescriptionId) {
        Invoice invoice = invoiceService.generateInvoice(prescriptionId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/by-prescription/{prescriptionId}")
    public ResponseEntity<InvoiceDto> getInvoiceByPrescription(@PathVariable String prescriptionId) {
        System.out.println("DEBUG: Controller - Fetching invoice for prescription: " + prescriptionId);
        Invoice invoice = invoiceService.getInvoiceByPrescriptionId(prescriptionId);
        System.out.println("DEBUG: Controller - Invoice found: " + (invoice != null));
        
        if (invoice != null) {
            System.out.println("DEBUG: Controller - Invoice ID: " + invoice.getId());
            System.out.println("DEBUG: Controller - Patient: " + (invoice.getPatient() != null ? invoice.getPatient().getName() : "null"));
            System.out.println("DEBUG: Controller - Invoice items count: " + (invoice.getInvoiceItems() != null ? invoice.getInvoiceItems().size() : 0));
            
            // Convert to DTO with proper field mapping
            InvoiceDto invoiceDto = convertToDto(invoice);
            System.out.println("DEBUG: Controller - Converted DTO with patientName: " + invoiceDto.getPatientName());
            return ResponseEntity.ok(invoiceDto);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    private InvoiceDto convertToDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setCreatedAt(invoice.getCreatedAt());
        
        // Map patient information
        if (invoice.getPatient() != null) {
            dto.setPatientName(invoice.getPatient().getName());
        }
        
        // Map prescription ID
        if (invoice.getPrescription() != null) {
            dto.setPrescriptionId(invoice.getPrescription().getId());
        }
        
        // Map invoice items
        if (invoice.getInvoiceItems() != null) {
            List<InvoiceItemDto> itemDtos = invoice.getInvoiceItems().stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList());
            dto.setInvoiceItems(itemDtos);
        }
        
        return dto;
    }
    
    private InvoiceItemDto convertItemToDto(com.mis.model.Invoice.InvoiceItem item) {
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(item.getId());
        dto.setMedicineName(item.getMedicineName());
        dto.setDosage(item.getDosage());
        dto.setDispenseQuantity(item.getDispenseQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }
}