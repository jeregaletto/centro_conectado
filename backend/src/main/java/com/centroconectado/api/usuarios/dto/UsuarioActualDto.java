package com.centroconectado.api.usuarios.dto;

import java.util.Set;

import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Rol;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.Vista;

/** Lo que el frontend necesita para decidir qué pantallas y botones mostrar. */
public record UsuarioActualDto(
        Long id,
        String usuario,
        String nombre,
        String apellido,
        String puesto,
        Rol rol,
        String rolEtiqueta,
        Vista vista,
        SectorResumenDto sector,
        Set<Permiso> permisos,
        boolean debeCambiarPassword) {

    public static UsuarioActualDto de(Usuario u) {
        return new UsuarioActualDto(u.getId(), u.getUsuario(), u.getNombre(), u.getApellido(), u.getPuesto(),
                u.getRol(), u.getRol().getEtiqueta(), u.getRol().getVista(), SectorResumenDto.de(u.getSector()),
                u.getRol().getPermisos(), u.isDebeCambiarPassword());
    }
}
