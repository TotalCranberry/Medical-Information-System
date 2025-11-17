package com.mis.service;

import com.mis.dto.MedicalFormRequest;
import com.mis.model.DentalExam;
import com.mis.model.EyeExam;
import com.mis.model.MedicalRecord;
import com.mis.model.PhysicalExam;
import com.mis.model.User;
import com.mis.repository.MedicalRecordRepository;
import com.mis.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicalFormService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public MedicalFormService(MedicalRecordRepository medicalRecordRepository, UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void saveMedicalForm(String username, MedicalFormRequest request) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setUser(user);

        MedicalFormRequest.MedicalHistory medicalHistory = request.getMedicalHistory();
        medicalRecord.setPastHospitalAdmissions(medicalHistory.getPastHospitalAdmissions());
        medicalRecord.setChronicIllnesses(medicalHistory.getChronicIllnesses());
        medicalRecord.setPhysicalDisabilities(medicalHistory.getPhysicalDisabilities());
        medicalRecord.setAllergies(medicalHistory.getAllergies());

        MedicalFormRequest.EmergencyContact emergencyContact = request.getEmergencyContact();
        medicalRecord.setEmergencyContactName(emergencyContact.getName());
        medicalRecord.setEmergencyContactAddress(emergencyContact.getAddress());
        medicalRecord.setEmergencyContactPhone(emergencyContact.getPhone());

        MedicalRecord savedMedicalRecord = medicalRecordRepository.save(medicalRecord);

        MedicalFormRequest.EyeExam eyeExamRequest = request.getEyeExam();
        EyeExam eyeExam = new EyeExam();
        eyeExam.setMedicalRecord(savedMedicalRecord);
        eyeExam.setVisionWithoutGlassesRight(eyeExamRequest.getVisionWithoutGlasses().getRight());
        eyeExam.setVisionWithoutGlassesLeft(eyeExamRequest.getVisionWithoutGlasses().getLeft());
        eyeExam.setVisionWithGlassesRight(eyeExamRequest.getVisionWithGlasses().getRight());
        eyeExam.setVisionWithGlassesLeft(eyeExamRequest.getVisionWithGlasses().getLeft());
        eyeExam.setColorVision(eyeExamRequest.getColorVision());
        savedMedicalRecord.setEyeExam(eyeExam);

        MedicalFormRequest.DentalExam dentalExamRequest = request.getDentalExam();
        DentalExam dentalExam = new DentalExam();
        dentalExam.setMedicalRecord(savedMedicalRecord);
        dentalExam.setOralHealthCondition(dentalExamRequest.getOralHealthCondition());
        savedMedicalRecord.setDentalExam(dentalExam);

        MedicalFormRequest.PhysicalExam physicalExamRequest = request.getPhysicalExam();
        PhysicalExam physicalExam = new PhysicalExam();
        physicalExam.setMedicalRecord(savedMedicalRecord);
        physicalExam.setWeightKg(String.valueOf(physicalExamRequest.getWeightKg()));
        physicalExam.setHeightCm(String.valueOf(physicalExamRequest.getHeightCm()));
        physicalExam.setBmi(String.valueOf(physicalExamRequest.getBmi()));
        physicalExam.setVaccinationStatus(physicalExamRequest.getVaccinationStatus());
        savedMedicalRecord.setPhysicalExam(physicalExam);

        medicalRecordRepository.save(savedMedicalRecord);
    }
}