package com.centroconectado.api.usuarios;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.dto.ActualizarUsuarioRequest;
import com.centroconectado.api.usuarios.dto.AsignarReferenteRequest;
import com.centroconectado.api.usuarios.dto.CrearUsuarioRequest;
import com.centroconectado.api.usuarios.dto.ResetPasswordRequest;
import com.centroconectado.api.usuarios.dto.SectorDto;
import com.centroconectado.api.usuarios.dto.UsuarioAdminDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')")
public class UsuarioAdminController {

    private final UsuarioAdminService service;

    public UsuarioAdminController(UsuarioAdminService service) {
        this.service = service;
    }

    @GetMapping("/usuarios")
    public List<UsuarioAdminDto> listar() {
        return service.listar();
    }

    @PostMapping("/usuarios")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioAdminDto crear(@Valid @RequestBody CrearUsuarioRequest request,
                                 @AuthenticationPrincipal UsuarioAutenticado actor) {
        return service.crear(request, actor);
    }

    @PutMapping("/usuarios/{id}")
    public UsuarioAdminDto actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarUsuarioRequest request,
                                      @AuthenticationPrincipal UsuarioAutenticado actor) {
        return service.actualizar(id, request, actor);
    }

    @PostMapping("/usuarios/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request,
                              @AuthenticationPrincipal UsuarioAutenticado actor) {
        service.resetPassword(id, request.passwordTemporal(), actor);
    }

    @PutMapping("/sectores/{id}/referente")
    public SectorDto asignarReferente(@PathVariable Long id, @Valid @RequestBody AsignarReferenteRequest request) {
        return service.asignarReferente(id, request.usuarioId());
    }
}
