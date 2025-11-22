package com.mis.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendMedicalCertificate(String toEmail, String fromEmail, String subject, String body, byte[] pdfAttachment, String attachmentName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setFrom(fromEmail);
        helper.setSubject(subject);
        helper.setText(body, true); // true indicates HTML content

        // Add PDF attachment
        if (pdfAttachment != null && pdfAttachment.length > 0) {
            ByteArrayResource pdfResource = new ByteArrayResource(pdfAttachment);
            helper.addAttachment(attachmentName, pdfResource, "application/pdf");
        }

        mailSender.send(message);
    }
}