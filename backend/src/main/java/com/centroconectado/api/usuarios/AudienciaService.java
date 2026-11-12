package com.centroconectado.api.usuarios;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Resuelve a quién le llega un contenido según sus sectores destino (vacío = todo el Centro). */
@Service
public class AudienciaService {

    private final UsuarioRepository usuarioRepository;

    public AudienciaService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Usuario> destinatarios(Collection<Sector> sectores) {
        if (sectores == null || sectores.isEmpty()) {
            return usuarioRepository.findByActivoTrue();
        }
        return usuarioRepository.findByActivoTrueAndSectorIdIn(sectores.stream().map(Sector::getId).toList());
    }

    @Transactional(readOnly = true)
    public List<Usuario> gestoresGenerales() {
        return usuarioRepository.findByActivoTrueAndRolIn(List.of(Rol.DIRECCION, Rol.COMUNICACION));
    }
}
