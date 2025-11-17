package com.mis.mapper;

import com.mis.dto.RegisterRequest;
import com.mis.dto.UserResponse;
import com.mis.model.MedicalRecord;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.model.User;

public class UserMapper {

    public static User toUser(RegisterRequest req) {
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setRole(req.getRole());
        user.setAuthMethod(req.getAuthMethod());
        return user;
    }
    
    public static UserResponse toUserResponse(User user, Student student, Staff staff, MedicalRecord medicalRecord) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAuthMethod(user.getAuthMethod());
        dto.setMedicalRecord(medicalRecord != null);

        if (student != null) {
            dto.setFaculty(student.getFaculty());
            dto.setDateOfBirth(student.getDateOfBirth());
            dto.setAge(student.getAge()); 
            dto.setGender(student.getGender());
        } 
        else if (staff != null) {
            dto.setFaculty(staff.getFaculty());
            dto.setDateOfBirth(staff.getDateOfBirth());
            dto.setAge(staff.getAge()); 
            dto.setGender(staff.getGender());
        }
        
        return dto;
    }
}
