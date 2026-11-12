package com.centroconectado.api.usuarios;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.CampoInvalidoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.security.UsuarioAutenticado;

/**
 * Decide a qué sectores puede dirigir un contenido quien publica.
 * Dirección/Comunicación: cualquiera o todo el Centro (lista vacía). Referente: solo su sector.
 */
@Service
public class AlcancePublicacionService {

    private final SectorRepository sectorRepository;

    public AlcancePublicacionService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    @Transactional(readOnly = true)
    public Set<Sector> resolver(List<Long> sectorIds, UsuarioAutenticado actor) {
        List<Long> ids = sectorIds == null ? List.of() : sectorIds.stream().distinct().toList();
        if (actor.tiene(Permiso.PUBLICAR_GENERAL)) {
            Set<Sector> sectores = new HashSet<>(sectorRepository.findAllById(ids));
            if (sectores.size() != ids.size()) {
                throw new RecursoNoEncontradoException("Alguno de los sectores indicados no existe");
            }
            return sectores;
        }
        if (actor.tiene(Permiso.PUBLICAR_SECTOR)) {
            if (!ids.isEmpty() && !(ids.size() == 1 && ids.get(0).equals(actor.sectorId()))) {
                // Es un dato mal elegido (no un rol sin permiso): se señala en el campo sectorIds.
                throw new CampoInvalidoException("sectorIds", "Como referente solo podés publicar para tu sector");
            }
            Sector propio = sectorRepository.findById(actor.sectorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Sector", actor.sectorId()));
            return new HashSet<>(Set.of(propio));
        }
        throw new AccesoDenegadoException("Tu rol no puede publicar contenido");
    }
}
