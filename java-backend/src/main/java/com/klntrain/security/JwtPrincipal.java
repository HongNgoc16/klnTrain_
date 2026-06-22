package com.klntrain.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtPrincipal {
    private final Long id;
    private final String email;
    private final String role;
}
