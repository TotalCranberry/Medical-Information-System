package com.mis.controller.Invoice;

import com.mis.dto.Invoice.InvoiceDto;
import com.mis.dto.Invoice.InvoiceItemDto;
import com.mis.dto.Invoice.InvoiceSummaryDto;
import com.mis.model.Invoice.Invoice;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.service.Invoice.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;

    public InvoiceController(InvoiceService invoiceService, StudentRepository studentRepository, StaffRepository staffRepository) {
        this.invoiceService = invoiceService;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
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

            // Fetch age and gender from Student or Staff
            if (invoice.getPatient().getRole() == Role.Student) {
                Student student = studentRepository.findById(invoice.getPatient().getId()).orElse(null);
                if (student != null) {
                    dto.setPatientAge(student.getAge());
                    dto.setPatientGender(student.getGender());
                }
            } else if (invoice.getPatient().getRole() == Role.Staff) {
                Staff staff = staffRepository.findById(invoice.getPatient().getId()).orElse(null);
                if (staff != null) {
                    dto.setPatientAge(staff.getAge());
                    dto.setPatientGender(staff.getGender());
                }
            }
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

    @GetMapping("/staff")
    public ResponseEntity<List<InvoiceSummaryDto>> getStaffInvoices() {
        List<InvoiceSummaryDto> invoices = invoiceService.getStaffInvoices();
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable Long id) {
        Invoice invoice = invoiceService.getInvoiceById(id);
        if (invoice != null) {
            InvoiceDto invoiceDto = convertToDto(invoice);
            return ResponseEntity.ok(invoiceDto);
        }
        return ResponseEntity.notFound().build();
    }
}