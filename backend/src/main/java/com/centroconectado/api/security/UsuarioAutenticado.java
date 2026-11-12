package com.centroconectado.api.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Rol;
import com.centroconectado.api.usuarios.Usuario;

/**
 * Principal que viaja en el SecurityContext. Se arma desde los claims del JWT, sin ir a la base en cada request.
 */
public record UsuarioAutenticado(Long id, String usuario, Rol rol, Long sectorId) {

    /** Para procesos internos (jobs) que actúan "en nombre de" cada usuario. */
    public static UsuarioAutenticado de(Usuario u) {
        return new UsuarioAutenticado(u.getId(), u.getUsuario(), u.getRol(), u.getSector().getId());
    }

    public boolean tiene(Permiso permiso) {
        return rol.getPermisos().contains(permiso);
    }

    /** Dirección y Calidad/Comunicación: alcance sobre todo el Centro. */
    public boolean esGestorGeneral() {
        return rol == Rol.DIRECCION || rol == Rol.COMUNICACION;
    }

    public List<GrantedAuthority> authorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.name()));
        rol.getPermisos().forEach(p -> authorities.add(new SimpleGrantedAuthority(p.name())));
        return authorities;
    }
}
