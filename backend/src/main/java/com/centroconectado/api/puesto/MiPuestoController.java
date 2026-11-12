package com.centroconectado.api.puesto;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.puesto.dto.AvanceUsuarioDto;
import com.centroconectado.api.puesto.dto.GuardarTareaRequest;
import com.centroconectado.api.puesto.dto.MiPuestoDto;
import com.centroconectado.api.puesto.dto.TareaPuestoDto;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
public class MiPuestoController {

    private static final String GESTIONA = "hasAnyAuthority('GESTIONAR_TAREAS_GENERAL','GESTIONAR_TAREAS_SECTOR')";

    private final MiPuestoService service;

    public MiPuestoController(MiPuestoService service) {
        this.service = service;
    }

    @GetMapping("/api/mi-puesto")
    public MiPuestoDto miPuesto(@AuthenticationPrincipal UsuarioAutenticado u) {
        return service.miPuesto(u);
    }

    @PostMapping("/api/mi-puesto/tareas/{id}/completar")
    public MiPuestoDto completar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.completar(id, u);
    }

    @DeleteMapping("/api/mi-puesto/tareas/{id}/completar")
    public MiPuestoDto desmarcar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.desmarcar(id, u);
    }

    @GetMapping("/api/puesto/tareas")
    @PreAuthorize(GESTIONA)
    public List<TareaPuestoDto> listarTareas(@RequestParam(required = false) Long sectorId,
                                             @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.listarTareas(sectorId, u);
    }

    @PostMapping("/api/puesto/tareas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(GESTIONA)
    public TareaPuestoDto crearTarea(@Valid @RequestBody GuardarTareaRequest request,
                                     @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.crearTarea(request, u);
    }

    @PutMapping("/api/puesto/tareas/{id}")
    @PreAuthorize(GESTIONA)
    public TareaPuestoDto actualizarTarea(@PathVariable Long id, @Valid @RequestBody GuardarTareaRequest request,
                                          @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.actualizarTarea(id, request, u);
    }

    @DeleteMapping("/api/puesto/tareas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(GESTIONA)
    public void eliminarTarea(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        service.eliminarTarea(id, u);
    }

    @GetMapping("/api/puesto/avance")
    @PreAuthorize(GESTIONA)
    public List<AvanceUsuarioDto> avanceSector(@RequestParam(required = false) Long sectorId,
                                               @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.avanceSector(sectorId, u);
    }
}
