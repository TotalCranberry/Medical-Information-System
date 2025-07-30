package com.mis.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mis.repository.UserRepository;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    private final UserRepository userRepository;
    
    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @GetMapping("/db-check")
    public String checkDbConnection() {
        try {
            long count = userRepository.count();
            return "✅ DB connection is healthy. User count: " + count;
        } catch (Exception e) {
            return "❌ DB connection failed: " + e.getMessage();
        }
    }
    @GetMapping("/public-hello")
    public String hello() {
        return "Hello, world!";
    }

}
