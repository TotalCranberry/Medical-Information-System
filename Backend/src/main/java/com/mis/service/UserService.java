package com.mis.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.mis.dto.ProfileUpdateRequest;
import com.mis.dto.UserResponse;
import com.mis.mapper.UserMapper;
import com.mis.model.AccountStatus;
import com.mis.model.AuthMethod;
import com.mis.model.Doctor;
import com.mis.model.MedicalRecord;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.model.User;
import com.mis.repository.DoctorRepository;
import com.mis.repository.MedicalRecordRepository;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       StudentRepository studentRepository, MedicalRecordRepository medicalRecordRepository, StaffRepository staffRepository,
                       DoctorRepository doctorRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.doctorRepository = doctorRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.auditService = auditService;
    }

    @Transactional 
    public User register(User user, String rawPassword) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }
        
        user.setId(UUID.randomUUID().toString());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        if (user.getRole() == Role.Student) {
            user.setStatus(AccountStatus.ACTIVE);
        } else {
            user.setStatus(AccountStatus.PENDING_APPROVAL);
        }
        user.setLastLogin(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String faculty = extractFacultyFromEmail(savedUser.getEmail());
        if (savedUser.getRole() == Role.Student) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setFaculty(faculty);
            student.setRegistrationNumber(student.extractRegistrationNumberFromEmail());
            studentRepository.save(student);
        } else if (savedUser.getRole() == Role.Staff) {
            Staff staff = new Staff();
            staff.setUser(savedUser);
            staff.setFaculty("N/A");
            staffRepository.save(staff);
        } else if (savedUser.getRole() == Role.Doctor) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctorRepository.save(doctor);
        }
        
        // Log the USER_REGISTRATION event
        auditService.logAction(savedUser, "USER_REGISTRATION", "User registered successfully with role: " + savedUser.getRole());
        
        return savedUser;
    }

    @Transactional
    public User processGoogleUser(Payload payload) {
        String email = payload.getEmail();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            existingUser.setLastLogin(LocalDateTime.now());
            User savedUser = userRepository.save(existingUser);
            // Log the GOOGLE_USER_LOGIN event
            auditService.logAction(savedUser, "GOOGLE_USER_LOGIN", "User logged in with Google successfully");
            return savedUser;
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(email);
        newUser.setName((String) payload.get("name"));
        newUser.setAuthMethod(AuthMethod.GoogleAuth);
        newUser.setRole(determineRoleFromEmail(email));
        newUser.setLastLogin(LocalDateTime.now());
        newUser.setStatus(AccountStatus.ACTIVE);
        newUser.setPasswordHash(null); 
        User savedUser = userRepository.save(newUser);
        
        String faculty = extractFacultyFromEmail(email);
        if (savedUser.getRole() == Role.Student) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setFaculty(faculty);
            student.setRegistrationNumber(student.extractRegistrationNumberFromEmail());
            studentRepository.save(student);
        } else if (savedUser.getRole() == Role.Staff) {
            Staff staff = new Staff();
            staff.setUser(savedUser);
            staff.setFaculty(faculty);
            staffRepository.save(staff);
        } else if (savedUser.getRole() == Role.Doctor) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctorRepository.save(doctor);
        }
        
        return savedUser;
    }

    @Transactional
    public User updateUserProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getDateOfBirth() != null) {
            updateRoleSpecificProfile(user, request.getDateOfBirth(), null, null, null, null);
        }

        if (request.getGender() != null && !request.getGender().isEmpty()) {
            updateRoleSpecificProfile(user, request.getDateOfBirth(), request.getGender(), null, null, null);
        }

        if (request.getHostel() != null && !request.getHostel().isEmpty()) {
            updateRoleSpecificProfile(user, request.getDateOfBirth(), request.getGender(), request.getHostel(), null, null);
        }

        if (request.getRoomNumber() != null && !request.getRoomNumber().isEmpty()) {
            updateRoleSpecificProfile(user, request.getDateOfBirth(), request.getGender(), request.getHostel(), request.getRoomNumber(), null);
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            updateRoleSpecificProfile(user, request.getDateOfBirth(), request.getGender(), request.getHostel(), request.getRoomNumber(), request.getPhoneNumber());
        }

        User savedUser = userRepository.save(user);
        // Log the PROFILE_UPDATE event
        auditService.logAction(savedUser, "PROFILE_UPDATE", "User profile updated successfully");
        
        return savedUser;
    }

    private void updateRoleSpecificProfile(User user, LocalDate dateOfBirth, String gender, String hostel, String roomNumber, String phoneNumber) {
        if (user.getRole() == Role.Student) {
            Student student = studentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            if (dateOfBirth != null) {
                student.setDateOfBirth(dateOfBirth);
            }
            if (gender != null) {
                student.setGender(gender);
            }
            if (hostel != null) {
                student.setHostel(hostel);
            }
            if (roomNumber != null) {
                student.setRoomNumber(roomNumber);
            }
            if (phoneNumber != null) {
                student.setPhoneNumber(phoneNumber);
            }
            studentRepository.save(student);
        } else if (user.getRole() == Role.Staff) {
            Staff staff = staffRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Staff profile not found"));
            if (dateOfBirth != null) {
                staff.setDateOfBirth(dateOfBirth);
            }
            if (gender != null) {
                staff.setGender(gender);
            }
            staffRepository.save(staff);
        }
    }

    public UserResponse getUserResponse(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Student student = null;
        Staff staff = null;
        Doctor doctor = null;

        if (user.getRole() == Role.Student) {
            student = studentRepository.findById(user.getId()).orElse(null);
        } else if (user.getRole() == Role.Staff) {
            staff = staffRepository.findById(user.getId()).orElse(null);
        } else if (user.getRole() == Role.Doctor) {
            doctor = doctorRepository.findById(user.getId()).orElse(null);
        }
        MedicalRecord medicalRecord = medicalRecordRepository.findByUser_Id(userId).orElse(null);

        return UserMapper.toUserResponse(user, student, staff, medicalRecord);
     }

    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                if (user.getStatus() == AccountStatus.PENDING_APPROVAL) {
                    auditService.logAction(user, "FAILED_LOGIN_ATTEMPT", "Login attempt for pending approval account");
                    throw new IllegalStateException("Your account is pending approval by an administrator.");
                }
                if (user.getStatus() == AccountStatus.DISABLED) {
                    auditService.logAction(user, "FAILED_LOGIN_ATTEMPT", "Login attempt for disabled account");
                    throw new IllegalStateException("Your account has been disabled.");
                }
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                // Log the USER_LOGIN event
                auditService.logAction(user, "USER_LOGIN", "User logged in successfully");
                return Optional.of(user);
            } else {
                auditService.logAction(user, "FAILED_LOGIN_ATTEMPT", "Incorrect password attempt");
                throw new IllegalStateException("Incorrect email or password.");
            }
        }
        return Optional.empty();
    }
    
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }


    
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent password change for Google users
        if (user.getAuthMethod() == AuthMethod.GoogleAuth) {
            throw new IllegalStateException("Cannot change password for an account registered with Google.");
        }

        // Verify the current password is correct
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalStateException("Incorrect current password.");
        }

        // Encode and set the new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        User savedUser = userRepository.save(user);
        // Log the PASSWORD_CHANGE event
        auditService.logAction(savedUser, "PASSWORD_CHANGE", "User password changed successfully");
    }

    private String extractFacultyFromEmail(String email) {
        try {
            String[] emailParts = email.split("@");
            if (emailParts.length > 1) {
                String domain = emailParts[1];
                String[] domainParts = domain.split("\\.");
                if (domainParts.length > 0) {
                    String facultyCode = domainParts[0].toLowerCase();

                    Map<String, String> facultyMap = Map.of(
                        "agri", "Agriculture",
                        "ahs", "Allied Health Sciences",
                        "arts", "Arts",
                        "dental", "Dental",
                        "eng", "Engineering",
                        "mgt", "Management",
                        "med", "Medicine",
                        "sci", "Science",
                        "vet", "Veterinary Medicine and Animal Sciences"
                    );

                    return facultyMap.getOrDefault(facultyCode, facultyCode);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting faculty from email: " + e.getMessage());
        }
        return null;
    }


    
    private Role determineRoleFromEmail(String email) {
        try {
            String localPart = email.split("@")[0];
            // Check for 5 consecutive digits
            boolean isStudent = localPart.matches(".*\\d{5}.*");
            return isStudent ? Role.Student : Role.Staff;
        } catch (Exception e) {
            // Default to Student if unable to determine
            return Role.Student;
        }
    }


    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No authentication found in security context.");
        }

        String username;
        Object principal = auth.getPrincipal();

        if (principal instanceof UserDetails ud) {
            username = ud.getUsername();
        } else if (principal instanceof String s) {
            username = s;
        } else {
            throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
        }

        return userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalStateException("Logged-in user not found by email: " + username));
    }

    // Method to ensure Doctor entity exists for users with Doctor role
    @Transactional
    public void ensureDoctorEntityExists(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.Doctor) {
            Optional<Doctor> existingDoctor = doctorRepository.findById(userId);
            if (existingDoctor.isEmpty()) {
                Doctor doctor = new Doctor();
                doctor.setUser(user);
                doctorRepository.save(doctor);
            }
        }
    }
}