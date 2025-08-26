package com.mis.configuration;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.mis.security.JwtTokenFilter;

@Configuration
public class SecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;

    public SecurityConfig(JwtTokenFilter jwtTokenFilter) {
        this.jwtTokenFilter = jwtTokenFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/google").permitAll()

                        // Public error page
                        .requestMatchers("/error").permitAll()

                        // Profile endpoints accessible by any authenticated user
                        .requestMatchers("/api/auth/profile", "/api/profile/**").authenticated()

                        // Support request endpoint accessible by any authenticated user
                        .requestMatchers("/api/support/**").authenticated()

                        // Admin-specific endpoints
                        .requestMatchers("/api/support/tickets").hasAuthority("ROLE_Admin")

                        // Role-specific endpoints
                        .requestMatchers("/api/patient/**").hasAnyAuthority("ROLE_Student", "ROLE_Staff")
                        .requestMatchers("/api/doctor/**").hasAuthority("ROLE_Doctor")

                        // Medicine endpoints (Pharmacist only)
                        .requestMatchers("/api/medicines/**").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers(HttpMethod.GET, "/api/medicines/**")
                        .hasAnyAuthority("ROLE_Doctor", "ROLE_Pharmacist")

                        // Prescription endpoints (Doctor and Pharmacist)
                        .requestMatchers("/api/prescriptions/create").hasAuthority("ROLE_Doctor")
                        .requestMatchers("/api/prescriptions/doctor/**").hasAuthority("ROLE_Doctor")
                        .requestMatchers("/api/prescriptions/patient/**").hasAuthority("ROLE_Doctor")
                        .requestMatchers("/api/prescriptions/appointment/**").hasAuthority("ROLE_Doctor")
                        .requestMatchers("/api/prescriptions/pharmacy/**").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers("/api/prescriptions/status/**").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers("/api/prescriptions/*/status").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers("/api/prescriptions/overdue").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers("/api/prescriptions/statistics").hasAuthority("ROLE_Pharmacist")
                        .requestMatchers("/api/prescriptions/**").hasAnyAuthority("ROLE_Doctor", "ROLE_Pharmacist")

                        // Any other request must be authenticated.
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}