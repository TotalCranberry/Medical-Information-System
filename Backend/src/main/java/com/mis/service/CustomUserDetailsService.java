package com.mis.service;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.mis.model.User;
import com.mis.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository repository) {
        this.userRepository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        // ✅ FIXED: Force uppercase and add ROLE_ prefix to match Spring Security expectations
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        // ✅ For users without passwords (e.g., Google login), use empty string
        // Handle users without a password (e.g., Google login)
        // The Spring Security User object requires a non-null password.
        // We provide an empty string for users who don't have a password hash.

        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getId(), // This becomes the authentication name (you retrieve via authentication.getName())
                password,
                Collections.singleton(authority)
        );
    }
}
