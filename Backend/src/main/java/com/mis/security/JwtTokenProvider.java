package com.mis.security;

import com.mis.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}") // in milliseconds, e.g., 3600000 = 1 hour
    private long validityInMilliseconds;

    private Key key;

    @PostConstruct
    protected void init() {
        // Decode secret key string to byte and create signing key
        key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Create token containing user's id and role
    public String createToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getId());
        claims.put("role", user.getRole().name());

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Get user id from token
    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
                   .setSigningKey(key)
                   .build()
                   .parseClaimsJws(token)
                   .getBody()
                   .getSubject();
    }

    // Validate token: signature and expiration
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Invalid token
            return false;
        }
    }
}

