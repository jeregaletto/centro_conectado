package com.centroconectado.api.buzon;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.buzon.dto.CambiarEstadoMensajeRequest;
import com.centroconectado.api.buzon.dto.EnviarMensajeRequest;
import com.centroconectado.api.buzon.dto.MensajeBuzonDto;
import com.centroconectado.api.buzon.dto.ResponderMensajeRequest;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/buzon")
public class BuzonController {

    private static final String GESTIONA = "hasAuthority('GESTIONAR_BUZON')";

    private final BuzonService service;

    public BuzonController(BuzonService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MensajeBuzonDto enviar(@Valid @RequestBody EnviarMensajeRequest request,
                                  @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.enviar(request, u);
    }

    @GetMapping("/mios")
    public List<MensajeBuzonDto> mios(@AuthenticationPrincipal UsuarioAutenticado u) {
        return service.mios(u);
    }

    @GetMapping("/seguimiento/{codigo}")
    public MensajeBuzonDto seguimiento(@PathVariable String codigo) {
        return service.seguimiento(codigo);
    }

    @GetMapping("/gestion")
    @PreAuthorize(GESTIONA)
    public List<MensajeBuzonDto> gestion(@RequestParam(required = false) EstadoMensaje estado) {
        return service.gestion(estado);
    }

    @PostMapping("/{id}/responder")
    @PreAuthorize(GESTIONA)
    public MensajeBuzonDto responder(@PathVariable Long id, @Valid @RequestBody ResponderMensajeRequest request,
                                     @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.responder(id, request.respuesta(), u);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize(GESTIONA)
    public MensajeBuzonDto cambiarEstado(@PathVariable Long id,
                                         @Valid @RequestBody CambiarEstadoMensajeRequest request) {
        return service.cambiarEstado(id, request.estado());
    }
}
