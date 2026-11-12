package com.centroconectado.api.biblioteca;

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

import com.centroconectado.api.biblioteca.dto.DocumentoDto;
import com.centroconectado.api.biblioteca.dto.GuardarDocumentoRequest;
import com.centroconectado.api.common.dto.RenovarRequest;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/biblioteca")
public class BibliotecaController {

    private static final String GESTIONA = "hasAuthority('GESTIONAR_BIBLIOTECA')";

    private final BibliotecaService service;

    public BibliotecaController(BibliotecaService service) {
        this.service = service;
    }

    @GetMapping
    public List<DocumentoDto> listar(@RequestParam(required = false) CategoriaDocumento categoria,
                                     @RequestParam(required = false) Long sectorId,
                                     @RequestParam(required = false) String q) {
        return service.listar(categoria, sectorId, q);
    }

    @GetMapping("/por-vencer")
    @PreAuthorize(GESTIONA)
    public List<DocumentoDto> porVencer() {
        return service.porVencer();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(GESTIONA)
    public DocumentoDto crear(@Valid @RequestBody GuardarDocumentoRequest request,
                              @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.crear(request, u);
    }

    @PutMapping("/{id}")
    @PreAuthorize(GESTIONA)
    public DocumentoDto actualizar(@PathVariable Long id, @Valid @RequestBody GuardarDocumentoRequest request) {
        return service.actualizar(id, request);
    }

    @PostMapping("/{id}/renovar")
    @PreAuthorize(GESTIONA)
    public DocumentoDto renovar(@PathVariable Long id, @RequestBody(required = false) RenovarRequest request) {
        return service.renovar(id, request == null ? null : request.vigenteHasta());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(GESTIONA)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
