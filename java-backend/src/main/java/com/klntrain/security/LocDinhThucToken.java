package com.klntrain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LocDinhThucToken extends OncePerRequestFilter {

    private final NhaCungCapToken nhaCungCapToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = tachToken(request);

        if (StringUtils.hasText(token) && nhaCungCapToken.xacThucToken(token)) {
            Long id    = nhaCungCapToken.layIdTuToken(token);
            String email = nhaCungCapToken.layEmailTuToken(token);
            String role  = nhaCungCapToken.layVaiTroTuToken(token);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                new ThongTinNguoiDung(id, email, role),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String tachToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
