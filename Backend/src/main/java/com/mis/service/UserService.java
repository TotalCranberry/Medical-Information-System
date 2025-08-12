package com.mis.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.mis.dto.ProfileUpdateRequest;
import com.mis.dto.UserResponse;
import com.mis.mapper.UserMapper;
import com.mis.model.AuthMethod;
import com.mis.model.Role;
import com.mis.model.Staff;
import com.mis.model.Student;
import com.mis.model.User;
import com.mis.repository.StaffRepository;
import com.mis.repository.StudentRepository;
import com.mis.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       StudentRepository studentRepository, StaffRepository staffRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
    }

    @Transactional 
    public User register(User user, String rawPassword) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }
        
        user.setId(UUID.randomUUID().toString());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLastLogin(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String faculty = extractFacultyFromEmail(savedUser.getEmail());
        if (savedUser.getRole() == Role.Student) {
            Student student = new Student();
            student.setUser(savedUser); 
            student.setFaculty(faculty);
            studentRepository.save(student);
        } else if (savedUser.getRole() == Role.Staff) {
            Staff staff = new Staff();
            staff.setUser(savedUser); 
            staff.setFaculty(faculty);
            staffRepository.save(staff);
        }
        
        return savedUser;
    }

    @Transactional
    public User processGoogleUser(Payload payload) {
        String email = payload.getEmail();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            existingUser.setLastLogin(LocalDateTime.now());
            return userRepository.save(existingUser);
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(email);
        newUser.setName((String) payload.get("name"));
        newUser.setAuthMethod(AuthMethod.GoogleAuth);
        newUser.setRole(determineRoleFromEmail(email));
        newUser.setLastLogin(LocalDateTime.now());
        newUser.setPasswordHash(null); 
        User savedUser = userRepository.save(newUser);
        
        String faculty = extractFacultyFromEmail(email);
        if (savedUser.getRole() == Role.Student) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setFaculty(faculty);
            studentRepository.save(student);
        } else if (savedUser.getRole() == Role.Staff) {
            Staff staff = new Staff();
            staff.setUser(savedUser);
            staff.setFaculty(faculty);
            staffRepository.save(staff);
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
            updateRoleSpecificProfile(user, request.getDateOfBirth());
        }

        return userRepository.save(user);
    }

    private void updateRoleSpecificProfile(User user, LocalDate dateOfBirth) {
        if (user.getRole() == Role.Student) {
            Student student = studentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            student.setDateOfBirth(dateOfBirth);
            studentRepository.save(student);
        } else if (user.getRole() == Role.Staff) {
            Staff staff = staffRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Staff profile not found"));
            staff.setDateOfBirth(dateOfBirth);
            staffRepository.save(staff);
        }
    }

    public UserResponse getUserResponse(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Student student = null;
        Staff staff = null;
        
        if (user.getRole() == Role.Student) {
            student = studentRepository.findById(user.getId()).orElse(null);
        } else if (user.getRole() == Role.Staff) {
            staff = staffRepository.findById(user.getId()).orElse(null);
        }
        
        return UserMapper.toUserResponse(user, student, staff);
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
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

        // Security Check 1: Prevent password change for Google users
        if (user.getAuthMethod() == AuthMethod.GoogleAuth) {
            throw new IllegalStateException("Cannot change password for an account registered with Google.");
        }

        // Security Check 2: Verify the current password is correct
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalStateException("Incorrect current password.");
        }

        // Encode and set the new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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

}
