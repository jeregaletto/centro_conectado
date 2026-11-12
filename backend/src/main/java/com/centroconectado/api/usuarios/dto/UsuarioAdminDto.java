package com.centroconectado.api.usuarios.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.usuarios.Rol;
import com.centroconectado.api.usuarios.Usuario;

public record UsuarioAdminDto(Long id, String usuario, String nombre, String apellido, String email,
                              String telefono, String interno, String puesto, Rol rol, SectorResumenDto sector,
                              boolean activo, boolean debeCambiarPassword, LocalDateTime creadoEn) {

    public static UsuarioAdminDto de(Usuario u) {
        return new UsuarioAdminDto(u.getId(), u.getUsuario(), u.getNombre(), u.getApellido(), u.getEmail(),
                u.getTelefono(), u.getInterno(), u.getPuesto(), u.getRol(), SectorResumenDto.de(u.getSector()),
                u.isActivo(), u.isDebeCambiarPassword(), u.getCreadoEn());
    }
}
