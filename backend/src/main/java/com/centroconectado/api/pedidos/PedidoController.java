package com.centroconectado.api.pedidos;

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

import com.centroconectado.api.pedidos.dto.CambiarEstadoPedidoRequest;
import com.centroconectado.api.pedidos.dto.ComentarioRequest;
import com.centroconectado.api.pedidos.dto.CrearPedidoRequest;
import com.centroconectado.api.pedidos.dto.PedidoDetalleDto;
import com.centroconectado.api.pedidos.dto.PedidoDto;
import com.centroconectado.api.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping("/recibidos")
    public List<PedidoDto> recibidos(@AuthenticationPrincipal UsuarioAutenticado u,
                                     @RequestParam(required = false) EstadoPedido estado) {
        return service.recibidos(u, estado);
    }

    @GetMapping("/enviados")
    public List<PedidoDto> enviados(@AuthenticationPrincipal UsuarioAutenticado u,
                                    @RequestParam(required = false) EstadoPedido estado) {
        return service.enviados(u, estado);
    }

    @GetMapping("/todos")
    @PreAuthorize("hasAuthority('VER_TODOS_LOS_PEDIDOS')")
    public List<PedidoDto> todos(@RequestParam(required = false) EstadoPedido estado) {
        return service.todos(estado);
    }

    @GetMapping("/{id}")
    public PedidoDetalleDto detalle(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.detalle(id, u);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoDetalleDto crear(@Valid @RequestBody CrearPedidoRequest request,
                                  @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.crear(request, u);
    }

    @PatchMapping("/{id}/estado")
    public PedidoDetalleDto cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoPedidoRequest request,
                                          @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.cambiarEstado(id, request, u);
    }

    @PostMapping("/{id}/comentarios")
    public PedidoDetalleDto comentar(@PathVariable Long id, @Valid @RequestBody ComentarioRequest request,
                                     @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.comentar(id, request.comentario(), u);
    }
}
