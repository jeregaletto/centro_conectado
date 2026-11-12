package com.centroconectado.api.avisos;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.avisos.dto.AvisoDto;
import com.centroconectado.api.avisos.dto.GuardarAvisoRequest;
import com.centroconectado.api.avisos.dto.LecturasDto;
import com.centroconectado.api.common.dto.RenovarRequest;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/avisos")
public class AvisoController {

    private static final String PUEDE_PUBLICAR = "hasAnyAuthority('PUBLICAR_GENERAL','PUBLICAR_SECTOR')";

    private final AvisoService service;

    public AvisoController(AvisoService service) {
        this.service = service;
    }

    @GetMapping
    public List<AvisoDto> listar(@AuthenticationPrincipal UsuarioAutenticado u,
                                 @RequestParam(required = false) TipoAviso tipo,
                                 @RequestParam(defaultValue = "false") boolean soloNoLeidos) {
        return service.listar(u, tipo, soloNoLeidos);
    }

    @GetMapping("/publicados")
    @PreAuthorize(PUEDE_PUBLICAR)
    public List<AvisoDto> publicados(@AuthenticationPrincipal UsuarioAutenticado u) {
        return service.publicados(u);
    }

    @GetMapping("/por-vencer")
    @PreAuthorize(PUEDE_PUBLICAR)
    public List<AvisoDto> porVencer(@AuthenticationPrincipal UsuarioAutenticado u) {
        return service.porVencer(u);
    }

    @GetMapping("/{id}")
    public AvisoDto obtener(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.obtener(id, u);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(PUEDE_PUBLICAR)
    public AvisoDto crear(@Valid @RequestBody GuardarAvisoRequest request,
                          @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.crear(request, u);
    }

    @PutMapping("/{id}")
    @PreAuthorize(PUEDE_PUBLICAR)
    public AvisoDto actualizar(@PathVariable Long id, @Valid @RequestBody GuardarAvisoRequest request,
                               @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.actualizar(id, request, u);
    }

    @PostMapping("/{id}/leido")
    public AvisoDto marcarLeido(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.marcarLeido(id, u);
    }

    @PostMapping("/{id}/renovar")
    @PreAuthorize(PUEDE_PUBLICAR)
    public AvisoDto renovar(@PathVariable Long id, @RequestBody(required = false) RenovarRequest request,
                            @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.renovar(id, request == null ? null : request.vigenteHasta(), u);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(PUEDE_PUBLICAR)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        service.eliminar(id, u);
    }

    @GetMapping("/{id}/lecturas")
    @PreAuthorize("hasAuthority('VER_LECTURAS')")
    public LecturasDto lecturas(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.lecturas(id, u);
    }
}
