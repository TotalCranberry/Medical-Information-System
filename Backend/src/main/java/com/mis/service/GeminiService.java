package com.mis.service;

import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    public String extractDataFromForm(String pdfText) {
        // This is a mock implementation.
        // In a real application, you would make an HTTP request to the Gemini API.
        // The prompt would be included in the request body along with the pdfText.
        String mockJsonResponse = "{\n" +
                "  \"personalInfo\": { \"name\": \"John Doe\", \"enrolmentNumber\": \"12345\", \"nic\": \"123456789V\", \"dateOfBirth\": \"1990-01-01\", \"sex\": \"Male\", \"nationality\": \"Sri Lankan\", \"religion\": \"Buddhist\", \"maritalStatus\": \"Single\" },\n" +
                "  \"medicalHistory\": { \"pastHospitalAdmissions\": \"None\", \"chronicIllnesses\": \"None\", \"physicalDisabilities\": \"None\", \"allergies\": \"None\" },\n" +
                "  \"emergencyContact\": { \"name\": \"Jane Doe\", \"address\": \"123, Main St, Colombo\", \"phone\": \"0771234567\" },\n" +
                "  \"eyeExam\": { \"visionWithoutGlasses\": { \"right\": \"6/6\", \"left\": \"6/6\" }, \"visionWithGlasses\": { \"right\": \"N/A\", \"left\": \"N/A\" }, \"colorVision\": \"Normal\" },\n" +
                "  \"dentalExam\": { \"oralHealthCondition\": \"Good\" },\n" +
                "  \"physicalExam\":{ \"weightKg\": 70, \"heightCm\": 175, \"bmi\": 22.86, \"vaccinationStatus\": \"Fully Vaccinated\" }\n" +
                "}";
        return mockJsonResponse;
    }
}