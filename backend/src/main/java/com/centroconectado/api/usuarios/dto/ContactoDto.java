package com.centroconectado.api.usuarios.dto;

import com.centroconectado.api.usuarios.Usuario;

public record ContactoDto(Long id, String nombre, String puesto, String sector, String telefono, String interno,
                          String email) {

    public static ContactoDto de(Usuario u) {
        if (u == null) {
            return null;
        }
        return new ContactoDto(u.getId(), u.getNombreCompleto(), u.getPuesto(), u.getSector().getNombre(),
                u.getTelefono(), u.getInterno(), u.getEmail());
    }
}
