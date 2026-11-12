package com.centroconectado.api.usuarios;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.dto.ActualizarUsuarioRequest;
import com.centroconectado.api.usuarios.dto.CrearUsuarioRequest;
import com.centroconectado.api.usuarios.dto.SectorDto;
import com.centroconectado.api.usuarios.dto.ContactoDto;
import com.centroconectado.api.usuarios.dto.UsuarioAdminDto;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final SectorRepository sectorRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public UsuarioAdminService(UsuarioRepository usuarioRepository, SectorRepository sectorRepository,
                               PasswordEncoder passwordEncoder, Clock clock) {
        this.usuarioRepository = usuarioRepository;
        this.sectorRepository = sectorRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<UsuarioAdminDto> listar() {
        return usuarioRepository.findAllConSector().stream().map(UsuarioAdminDto::de).toList();
    }

    @Transactional
    public UsuarioAdminDto crear(CrearUsuarioRequest req, UsuarioAutenticado actor) {
        validarAsignacionDeRol(req.rol(), actor);
        String usuario = req.usuario().trim();
        if (usuarioRepository.existsByUsuarioIgnoreCase(usuario)) {
            throw new ReglaNegocioException("Ya existe un usuario con " + usuario);
        }
        Sector sector = sector(req.sectorId());
        Usuario u = new Usuario(usuario, passwordEncoder.encode(req.passwordInicial()), req.nombre().trim(),
                req.apellido().trim(), req.puesto().trim(), req.rol(), sector, LocalDateTime.now(clock));
        u.setEmail(req.email());
        u.setTelefono(req.telefono());
        u.setInterno(req.interno());
        u.setDebeCambiarPassword(true);
        return UsuarioAdminDto.de(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioAdminDto actualizar(Long id, ActualizarUsuarioRequest req, UsuarioAutenticado actor) {
        Usuario u = usuario(id);
        validarAsignacionDeRol(req.rol(), actor);
        if (u.getRol() == Rol.DIRECCION && actor.rol() != Rol.DIRECCION) {
            throw new AccesoDenegadoException("Solo Dirección puede modificar usuarios de Dirección");
        }
        if (u.getId().equals(actor.id()) && !req.activo()) {
            throw new ReglaNegocioException("No podés desactivar tu propio usuario");
        }
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setEmail(req.email());
        u.setTelefono(req.telefono());
        u.setInterno(req.interno());
        u.setPuesto(req.puesto().trim());
        u.setRol(req.rol());
        u.setSector(sector(req.sectorId()));
        u.setActivo(req.activo());
        return UsuarioAdminDto.de(u);
    }

    @Transactional
    public void resetPassword(Long id, String passwordTemporal, UsuarioAutenticado actor) {
        Usuario u = usuario(id);
        if (u.getRol() == Rol.DIRECCION && actor.rol() != Rol.DIRECCION) {
            throw new AccesoDenegadoException("Solo Dirección puede blanquear claves de Dirección");
        }
        u.setPasswordHash(passwordEncoder.encode(passwordTemporal));
        u.setDebeCambiarPassword(true);
    }

    @Transactional
    public SectorDto asignarReferente(Long sectorId, Long usuarioId) {
        Sector sector = sector(sectorId);
        Usuario u = usuario(usuarioId);
        if (!u.getSector().getId().equals(sectorId)) {
            throw new ReglaNegocioException("El referente tiene que pertenecer al sector " + sector.getNombre());
        }
        if (u.getRol() != Rol.REFERENTE && u.getRol() != Rol.DIRECCION && u.getRol() != Rol.COMUNICACION) {
            u.setRol(Rol.REFERENTE);
        }
        sector.setReferente(u);
        return new SectorDto(sector.getId(), sector.getCodigo(), sector.getNombre(), sector.getDescripcion(),
                ContactoDto.de(u), usuarioRepository.countByActivoTrueAndSectorId(sectorId));
    }

    private void validarAsignacionDeRol(Rol rol, UsuarioAutenticado actor) {
        if (rol == Rol.DIRECCION && actor.rol() != Rol.DIRECCION) {
            throw new AccesoDenegadoException("Solo Dirección puede asignar el rol Dirección");
        }
    }

    private Usuario usuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    private Sector sector(Long id) {
        return sectorRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Sector", id));
    }
}
