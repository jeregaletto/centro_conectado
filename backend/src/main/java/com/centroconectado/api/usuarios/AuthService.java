package com.centroconectado.api.usuarios;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.common.exception.DemasiadosIntentosException;
import com.centroconectado.api.common.exception.NoAutenticadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.security.JwtService;
import com.centroconectado.api.security.LoginAttemptService;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.dto.CambiarPasswordRequest;
import com.centroconectado.api.usuarios.dto.LoginRequest;
import com.centroconectado.api.usuarios.dto.LoginResponse;
import com.centroconectado.api.usuarios.dto.UsuarioActualDto;

@Service
public class AuthService {

    private static final String CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    /** Hash ficticio: si el usuario no existe igual se ejecuta BCrypt y el tiempo de respuesta no lo delata. */
    private final String hashFicticio;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       LoginAttemptService loginAttemptService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.hashFicticio = passwordEncoder.encode("centro-conectado-hash-ficticio");
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String usuario = request.usuario().trim();
        if (loginAttemptService.estaBloqueado(usuario)) {
            throw new DemasiadosIntentosException("Demasiados intentos fallidos. Probá de nuevo en "
                    + loginAttemptService.getBloqueoMinutos() + " minutos o pedile a tu referente que te blanquee la clave.");
        }
        Usuario u = usuarioRepository.findByUsuarioIgnoreCase(usuario).filter(Usuario::isActivo).orElse(null);
        String hash = u != null ? u.getPasswordHash() : hashFicticio;
        boolean ok = passwordEncoder.matches(request.password(), hash);
        if (u == null || !ok) {
            loginAttemptService.registrarFallo(usuario);
            throw new NoAutenticadoException(CREDENCIALES_INVALIDAS);
        }
        loginAttemptService.registrarExito(usuario);
        JwtService.TokenEmitido token = jwtService.emitir(u);
        return new LoginResponse(token.token(), token.expiraEn(), UsuarioActualDto.de(u));
    }

    @Transactional(readOnly = true)
    public UsuarioActualDto usuarioActual(UsuarioAutenticado principal) {
        Usuario u = usuarioRepository.findById(principal.id())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new NoAutenticadoException("Tu usuario ya no está activo"));
        return UsuarioActualDto.de(u);
    }

    @Transactional
    public UsuarioActualDto cambiarPassword(UsuarioAutenticado principal, CambiarPasswordRequest request) {
        Usuario u = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", principal.id()));
        if (!passwordEncoder.matches(request.actual(), u.getPasswordHash())) {
            throw new ReglaNegocioException("La contraseña actual no es correcta");
        }
        if (request.actual().equals(request.nueva())) {
            throw new ReglaNegocioException("La nueva contraseña tiene que ser distinta de la actual");
        }
        u.setPasswordHash(passwordEncoder.encode(request.nueva()));
        u.setDebeCambiarPassword(false);
        return UsuarioActualDto.de(u);
    }
}
