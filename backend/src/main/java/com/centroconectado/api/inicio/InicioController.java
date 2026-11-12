package com.centroconectado.api.inicio;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.inicio.dto.InicioDto;
import com.centroconectado.api.inicio.dto.ResumenSemanalDto;
import com.centroconectado.api.security.UsuarioAutenticado;

@RestController
@RequestMapping("/api")
public class InicioController {

    private final InicioService inicioService;
    private final ResumenSemanalService resumenSemanalService;

    public InicioController(InicioService inicioService, ResumenSemanalService resumenSemanalService) {
        this.inicioService = inicioService;
        this.resumenSemanalService = resumenSemanalService;
    }

    @GetMapping("/inicio")
    public InicioDto inicio(@AuthenticationPrincipal UsuarioAutenticado u) {
        return inicioService.inicio(u);
    }

    @GetMapping("/resumen-semanal")
    public ResumenSemanalDto resumenSemanal(@AuthenticationPrincipal UsuarioAutenticado u) {
        return resumenSemanalService.resumen(u);
    }
}
