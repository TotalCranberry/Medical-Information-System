package com.mis.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.mis.model.Medical;
import com.mis.model.User;
import com.mis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class PdfService {

    @Autowired
    private UserRepository userRepository;

    public byte[] generateMedicalCertificatePdf(Medical medical) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        try {
            // Set margins
            document.setMargins(50, 50, 50, 50);

            // University Header
            Paragraph header = new Paragraph("UNIVERSITY OF PERADENIYA")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(header);

            Paragraph subHeader = new Paragraph("MEDICAL CERTIFICATE")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(subHeader);

            Paragraph info = new Paragraph("Medical Information System")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30);
            document.add(info);

            // Certificate ID and Date
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Paragraph certInfo = new Paragraph()
                    .add(new Text("Certificate ID: ").setBold())
                    .add(medical.getId())
                    .add(new Text(" | Issued Date: ").setBold())
                    .add(dateFormat.format(medical.getMedicalDate()))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(certInfo);

            // Patient Information Section
            Paragraph patientHeader = new Paragraph("PATIENT INFORMATION")
                    .setFontSize(14)
                    .setBold()
                    .setUnderline()
                    .setMarginBottom(10);
            document.add(patientHeader);

            Table patientTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            patientTable.addCell(createCell("Name:", true));
            patientTable.addCell(createCell(medical.getPatientName(), false));

            patientTable.addCell(createCell("Role:", true));
            patientTable.addCell(createCell(medical.getPatientRole(), false));

            patientTable.addCell(createCell("Age:", true));
            patientTable.addCell(createCell(medical.getPatientAge() != null ? medical.getPatientAge() + " years" : "N/A", false));

            patientTable.addCell(createCell("Faculty:", true));
            patientTable.addCell(createCell(medical.getPatientFaculty() != null ? medical.getPatientFaculty() : "N/A", false));

            patientTable.addCell(createCell("Email:", true));
            patientTable.addCell(createCell(medical.getPatientEmail(), false));

            document.add(patientTable);

            // Medical Recommendations Section
            Paragraph medicalHeader = new Paragraph("MEDICAL RECOMMENDATIONS")
                    .setFontSize(14)
                    .setBold()
                    .setUnderline()
                    .setMarginBottom(10);
            document.add(medicalHeader);

            Paragraph recommendations = new Paragraph(medical.getRecommendations())
                    .setFontSize(12)
                    .setMarginBottom(20)
                    .setFirstLineIndent(20);
            document.add(recommendations);

            // Additional Notes Section (if present)
            if (medical.getAdditionalNotes() != null && !medical.getAdditionalNotes().trim().isEmpty()) {
                Paragraph notesHeader = new Paragraph("ADDITIONAL NOTES")
                        .setFontSize(14)
                        .setBold()
                        .setUnderline()
                        .setMarginBottom(10);
                document.add(notesHeader);

                Paragraph notes = new Paragraph(medical.getAdditionalNotes())
                        .setFontSize(12)
                        .setMarginBottom(20)
                        .setFirstLineIndent(20);
                document.add(notes);
            }

            // Doctor Information
            User doctor = userRepository.findById(medical.getDoctorId()).orElse(null);
            if (doctor != null) {
                Paragraph doctorHeader = new Paragraph("ISSUED BY")
                        .setFontSize(14)
                        .setBold()
                        .setUnderline()
                        .setMarginBottom(10);
                document.add(doctorHeader);

                Paragraph doctorInfo = new Paragraph()
                        .add(new Text("Dr. ").setBold())
                        .add(doctor.getName())
                        .add(new Text("\nEmail: ").setBold())
                        .add(doctor.getEmail())
                        .setFontSize(12)
                        .setMarginBottom(30);
                document.add(doctorInfo);
            }

            // Signatures and Seal Section
            if ((medical.getDoctorSignature() != null && medical.getDoctorSignature().length > 0) ||
                (medical.getDoctorSeal() != null && medical.getDoctorSeal().length > 0)) {

                Paragraph authHeader = new Paragraph("DOCTOR AUTHENTICATION")
                        .setFontSize(14)
                        .setBold()
                        .setUnderline()
                        .setMarginBottom(15);
                document.add(authHeader);

                Table authTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMarginBottom(20);

                // Doctor Signature
                if (medical.getDoctorSignature() != null && medical.getDoctorSignature().length > 0) {
                    authTable.addCell(createCell("Doctor Signature:", true));
                    try {
                        ImageData imageData = ImageDataFactory.create(medical.getDoctorSignature());
                        com.itextpdf.layout.element.Image signatureImage = new com.itextpdf.layout.element.Image(imageData);
                        signatureImage.setWidth(UnitValue.createPercentValue(80));
                        signatureImage.setHorizontalAlignment(HorizontalAlignment.CENTER);
                        Cell signatureCell = new Cell().add(signatureImage).setPadding(10);
                        authTable.addCell(signatureCell);
                    } catch (Exception e) {
                        authTable.addCell(createCell("Signature image could not be loaded", false));
                    }
                }

                // Doctor Seal
                authTable.addCell(createCell("Doctor Seal:", true));
                if (medical.getDoctorSeal() != null && medical.getDoctorSeal().length > 0) {
                    try {
                        // Log seal information for debugging
                        System.out.println("Processing seal image - Size: " + medical.getDoctorSeal().length +
                                         ", ContentType: " + medical.getDoctorSealContentType());

                        // Validate image data before processing
                        if (medical.getDoctorSeal().length < 100) {
                            throw new Exception("Seal image data is too small, likely corrupted");
                        }

                        ImageData imageData = ImageDataFactory.create(medical.getDoctorSeal());
                        com.itextpdf.layout.element.Image sealImage = new com.itextpdf.layout.element.Image(imageData);
                        sealImage.setWidth(UnitValue.createPercentValue(80));
                        sealImage.setHorizontalAlignment(HorizontalAlignment.CENTER);
                        Cell sealCell = new Cell().add(sealImage).setPadding(10);
                        authTable.addCell(sealCell);
                        System.out.println("Seal image added successfully to PDF");
                    } catch (Exception e) {
                        System.err.println("Error processing seal image: " + e.getMessage());
                        // Add a text placeholder instead of failing
                        Cell placeholderCell = new Cell().add(new Paragraph("Doctor Seal\n(Not Available)").setFontSize(10).setItalic()).setPadding(10);
                        authTable.addCell(placeholderCell);
                    }
                } else {
                    System.out.println("No seal image found in medical record");
                    // Add a placeholder for missing seal
                    Cell placeholderCell = new Cell().add(new Paragraph("Doctor Seal\n(Not Provided)").setFontSize(10).setItalic()).setPadding(10);
                    authTable.addCell(placeholderCell);
                }

                document.add(authTable);
            }

            // Footer
            Paragraph footer = new Paragraph("This is an official medical certificate issued by the University of Peradeniya Medical Information System.")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic()
                    .setMarginTop(30);
            document.add(footer);

            Paragraph timestamp = new Paragraph("Generated on: " + dateFormat.format(new Date()))
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10);
            document.add(timestamp);

        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }

    private Cell createCell(String content, boolean isHeader) {
        Cell cell = new Cell();
        Paragraph paragraph = new Paragraph(content).setFontSize(isHeader ? 11 : 10);

        if (isHeader) {
            paragraph.setBold();
            cell.setBackgroundColor(ColorConstants.LIGHT_GRAY);
        }

        cell.add(paragraph).setPadding(8);
        return cell;
    }
}