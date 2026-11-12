package com.centroconectado.api.usuarios;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.dto.CambiarPasswordRequest;
import com.centroconectado.api.usuarios.dto.LoginRequest;
import com.centroconectado.api.usuarios.dto.LoginResponse;
import com.centroconectado.api.usuarios.dto.UsuarioActualDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UsuarioActualDto me(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return authService.usuarioActual(principal);
    }

    @PostMapping("/cambiar-password")
    public UsuarioActualDto cambiarPassword(@AuthenticationPrincipal UsuarioAutenticado principal,
                                            @Valid @RequestBody CambiarPasswordRequest request) {
        return authService.cambiarPassword(principal, request);
    }
}
