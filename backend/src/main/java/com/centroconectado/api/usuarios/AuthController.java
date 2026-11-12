package com.centroconectado.api.usuarios;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.security.JwtAuthenticationFilter;
import com.centroconectado.api.security.JwtService;
import com.centroconectado.api.security.RevocacionTokenService;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.servlet.http.HttpServletRequest;
import com.centroconectado.api.usuarios.dto.CambiarPasswordRequest;
import com.centroconectado.api.usuarios.dto.LoginRequest;
import com.centroconectado.api.usuarios.dto.LoginResponse;
import com.centroconectado.api.usuarios.dto.UsuarioActualDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RevocacionTokenService revocacion;

    public AuthController(AuthService authService, RevocacionTokenService revocacion) {
        this.authService = authService;
        this.revocacion = revocacion;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UsuarioActualDto me(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return authService.usuarioActual(principal);
    }

    /** Cierra la sesión: el token deja de valer aunque no haya vencido. */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        if (request.getAttribute(JwtAuthenticationFilter.ATRIBUTO_TOKEN) instanceof JwtService.TokenValidado token) {
            revocacion.revocar(token.jti(), token.expiraEn());
        }
    }

    @PostMapping("/cambiar-password")
    public UsuarioActualDto cambiarPassword(@AuthenticationPrincipal UsuarioAutenticado principal,
                                            @Valid @RequestBody CambiarPasswordRequest request) {
        return authService.cambiarPassword(principal, request);
    }
}
