package com.centroconectado.api.agenda;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

import com.centroconectado.api.agenda.dto.EventoDto;
import com.centroconectado.api.agenda.dto.GuardarEventoRequest;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agenda")
public class AgendaController {

    private static final String PUEDE_PUBLICAR = "hasAnyAuthority('PUBLICAR_GENERAL','PUBLICAR_SECTOR')";

    private final AgendaService service;

    public AgendaController(AgendaService service) {
        this.service = service;
    }

    @GetMapping
    public List<EventoDto> listar(@AuthenticationPrincipal UsuarioAutenticado u,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.listar(u, desde, hasta);
    }

    @GetMapping("/hoy")
    public List<EventoDto> hoy(@AuthenticationPrincipal UsuarioAutenticado u) {
        return service.hoy(u);
    }

    @GetMapping("/{id}")
    public EventoDto obtener(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.obtener(id, u);
    }

    @GetMapping("/{id}/ics")
    public ResponseEntity<byte[]> ics(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        byte[] contenido = service.ics(id, u).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"evento-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"))
                .body(contenido);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(PUEDE_PUBLICAR)
    public EventoDto crear(@Valid @RequestBody GuardarEventoRequest request,
                           @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.crear(request, u);
    }

    @PutMapping("/{id}")
    @PreAuthorize(PUEDE_PUBLICAR)
    public EventoDto actualizar(@PathVariable Long id, @Valid @RequestBody GuardarEventoRequest request,
                                @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.actualizar(id, request, u);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(PUEDE_PUBLICAR)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        service.eliminar(id, u);
    }
}
