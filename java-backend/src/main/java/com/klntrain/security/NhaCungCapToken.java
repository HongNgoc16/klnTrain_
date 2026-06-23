package com.klntrain.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class NhaCungCapToken {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey layKhoaKy() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String taoToken(Long id, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .claim("id", id)
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(layKhoaKy())
            .compact();
    }

    public Claims giaiMaToken(String token) {
        return Jwts.parser()
            .verifyWith(layKhoaKy())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean xacThucToken(String token) {
        try {
            giaiMaToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long layIdTuToken(String token) {
        Claims claims = giaiMaToken(token);
        Object idObj = claims.get("id");
        if (idObj instanceof Integer) return ((Integer) idObj).longValue();
        if (idObj instanceof Long) return (Long) idObj;
        return Long.parseLong(idObj.toString());
    }

    public String layEmailTuToken(String token) {
        return giaiMaToken(token).get("email", String.class);
    }

    public String layVaiTroTuToken(String token) {
        return giaiMaToken(token).get("role", String.class);
    }
}
