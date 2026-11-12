package com.centroconectado.api.usuarios;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.usuarios.dto.AQuienAcudirDto;
import com.centroconectado.api.usuarios.dto.ContactoDto;
import com.centroconectado.api.usuarios.dto.SectorDto;

/** Quién es quién: directorio, organigrama y "a quién acudir". */
@RestController
@RequestMapping("/api")
public class DirectorioController {

    private final DirectorioService directorioService;

    public DirectorioController(DirectorioService directorioService) {
        this.directorioService = directorioService;
    }

    @GetMapping("/directorio")
    public List<ContactoDto> directorio(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) Long sectorId) {
        return directorioService.buscar(q, sectorId);
    }

    @GetMapping("/sectores")
    public List<SectorDto> sectores() {
        return directorioService.sectores();
    }

    @GetMapping("/a-quien-acudir")
    public List<AQuienAcudirDto> aQuienAcudir() {
        return directorioService.aQuienAcudir();
    }
}
