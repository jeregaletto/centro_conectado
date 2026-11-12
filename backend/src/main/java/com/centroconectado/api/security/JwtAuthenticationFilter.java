package com.centroconectado.api.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * No es @Component a propósito: si lo fuera, Spring Boot lo registraría también como filtro
 * de servlet y se ejecutaría dos veces. Se instancia en SecurityConfig.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    /** Atributo del request con el token validado (lo usa el logout para revocarlo). */
    public static final String ATRIBUTO_TOKEN = "cc.token";

    private final JwtService jwtService;
    private final RevocacionTokenService revocacion;

    public JwtAuthenticationFilter(JwtService jwtService, RevocacionTokenService revocacion) {
        this.jwtService = jwtService;
        this.revocacion = revocacion;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(PREFIJO)) {
            try {
                JwtService.TokenValidado token = jwtService.validarToken(header.substring(PREFIJO.length()).trim());
                if (revocacion.estaRevocado(token.jti())) {
                    throw new JwtException("Token cerrado con logout");
                }
                UsuarioAutenticado principal = token.principal();
                request.setAttribute(ATRIBUTO_TOKEN, token);
                var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.authorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException ex) {
                // Token inválido o vencido: seguimos sin autenticar y el EntryPoint responde 401.
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
