package com.mis.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mis.dto.MedicalFormRequest;
import com.mis.dto.MedicalRecordResponseDTO;
import com.mis.mapper.MedicalRecordMapper;
import com.mis.model.DentalExam;
import com.mis.model.EyeExam;
import com.mis.model.MedicalRecord;
import com.mis.model.PhysicalExam;
import com.mis.model.User;
import com.mis.repository.DentalExamRepository;
import com.mis.repository.EyeExamRepository;
import com.mis.repository.MedicalRecordRepository;
import com.mis.repository.PhysicalExamRepository;
import com.mis.repository.UserRepository;

@Service
public class MedicalFormService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final EyeExamRepository eyeExamRepository;
    private final DentalExamRepository dentalExamRepository;
    private final PhysicalExamRepository physicalExamRepository;

    public MedicalFormService(MedicalRecordRepository medicalRecordRepository, UserRepository userRepository,
            EyeExamRepository eyeExamRepository, DentalExamRepository dentalExamRepository,
            PhysicalExamRepository physicalExamRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.eyeExamRepository = eyeExamRepository;
        this.dentalExamRepository = dentalExamRepository;
        this.physicalExamRepository = physicalExamRepository;
    }

    @Transactional
    public void saveMedicalForm(String username, MedicalFormRequest request) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (medicalRecordRepository.findByUser_Id(user.getId()).isPresent()) {
            throw new RuntimeException("Medical form already submitted.");
        }

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setUser(user);

        if (request.getMedicalHistory() != null) {
            medicalRecord.setPastHospitalAdmissions(request.getMedicalHistory().getPastHospitalAdmissions());
            medicalRecord.setChronicIllnesses(request.getMedicalHistory().getChronicIllnesses());
            medicalRecord.setPhysicalDisabilities(request.getMedicalHistory().getPhysicalDisabilities());
            medicalRecord.setAllergies(request.getMedicalHistory().getAllergies());
        }

        if (request.getEmergencyContact() != null) {
            medicalRecord.setEmergencyContactName(request.getEmergencyContact().getName());
            medicalRecord.setEmergencyContactAddress(request.getEmergencyContact().getAddress());
            medicalRecord.setEmergencyContactPhone(request.getEmergencyContact().getPhone());
        }

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);

        // Save Eye Exam
        if (request.getEyeExam() != null) {
            EyeExam eye = new EyeExam();
            eye.setMedicalRecord(savedRecord);
            if (request.getEyeExam().getVisionWithoutGlasses() != null) {
                eye.setVisionWithoutGlassesRight(request.getEyeExam().getVisionWithoutGlasses().getRight());
                eye.setVisionWithoutGlassesLeft(request.getEyeExam().getVisionWithoutGlasses().getLeft());
            }
            if (request.getEyeExam().getVisionWithGlasses() != null) {
                eye.setVisionWithGlassesRight(request.getEyeExam().getVisionWithGlasses().getRight());
                eye.setVisionWithGlassesLeft(request.getEyeExam().getVisionWithGlasses().getLeft());
            }
            eye.setColorVision(request.getEyeExam().getColorVision());
            eyeExamRepository.save(eye);
        }

        // Save Dental Exam
        if (request.getDentalExam() != null) {
            DentalExam dental = new DentalExam();
            dental.setMedicalRecord(savedRecord);
            dental.setOralHealthCondition(request.getDentalExam().getOralHealthCondition());
            dentalExamRepository.save(dental);
        }

        // Save Physical Exam
        if (request.getPhysicalExam() != null) {
            PhysicalExam physical = new PhysicalExam();
            physical.setMedicalRecord(savedRecord);
            physical.setWeightKg(request.getPhysicalExam().getWeightKg() != null ? String.valueOf(request.getPhysicalExam().getWeightKg()) : null);
            physical.setHeightCm(request.getPhysicalExam().getHeightCm() != null ? String.valueOf(request.getPhysicalExam().getHeightCm()) : null);
            physical.setBmi(request.getPhysicalExam().getBmi() != null ? String.valueOf(request.getPhysicalExam().getBmi()) : null);
            physical.setVaccinationStatus(request.getPhysicalExam().getVaccinationStatus());
            physicalExamRepository.save(physical);
        }
    }

    @Transactional(readOnly = true)
    public Optional<MedicalRecordResponseDTO> getFullMedicalRecordByUserId(String userId) {
        System.out.println("DEBUG: Fetching medical record for User ID: " + userId);
        
        Optional<MedicalRecord> medicalRecordOpt = medicalRecordRepository.findByUser_Id(userId);
        
        if (medicalRecordOpt.isEmpty()) {
            System.out.println("DEBUG: No medical record found in main table for User ID: " + userId);
            return Optional.empty();
        }

        MedicalRecord record = medicalRecordOpt.get();
        Long recordId = record.getId();
        System.out.println("DEBUG: Found Medical Record ID: " + recordId);

        EyeExam eyeExam = eyeExamRepository.findByMedicalRecordId(recordId).orElse(null);
        DentalExam dentalExam = dentalExamRepository.findByMedicalRecordId(recordId).orElse(null);
        PhysicalExam physicalExam = physicalExamRepository.findByMedicalRecordId(recordId).orElse(null);

        System.out.println("DEBUG: Exam Data Found - Eye: " + (eyeExam != null) + ", Dental: " + (dentalExam != null) + ", Physical: " + (physicalExam != null));

        MedicalRecordResponseDTO dto = MedicalRecordMapper.toMedicalRecordResponseDTO(record, eyeExam, dentalExam, physicalExam);
        return Optional.of(dto);
    }
}