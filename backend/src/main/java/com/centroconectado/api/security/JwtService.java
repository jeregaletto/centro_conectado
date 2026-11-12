package com.centroconectado.api.security;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.centroconectado.api.config.AppProperties;
import com.centroconectado.api.usuarios.Rol;
import com.centroconectado.api.usuarios.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String CLAIM_USUARIO = "usr";
    private static final String CLAIM_ROL = "rol";
    private static final String CLAIM_SECTOR = "sec";

    private final SecretKey key;
    private final int expiracionHoras;
    private final Clock clock;

    public JwtService(AppProperties props, Clock clock) {
        byte[] bytes = Decoders.BASE64.decode(props.jwt().secret());
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret debe tener al menos 32 bytes (256 bits) en base64");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expiracionHoras = props.jwt().expiracionHoras();
        this.clock = clock;
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant ahora = clock.instant();
        Instant expira = ahora.plus(expiracionHoras, ChronoUnit.HOURS);
        String token = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(usuario.getId()))
                .claim(CLAIM_USUARIO, usuario.getUsuario())
                .claim(CLAIM_ROL, usuario.getRol().name())
                .claim(CLAIM_SECTOR, usuario.getSector().getId())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expira))
                .signWith(key)
                .compact();
        return new TokenEmitido(token, expira);
    }

    /**
     * @throws JwtException si el token es inválido, está vencido o fue alterado.
     */
    public UsuarioAutenticado validar(String token) {
        return validarToken(token).principal();
    }

    /**
     * Como validar(), pero devuelve también el id del token (jti) y su vencimiento, para poder revocarlo.
     * @throws JwtException si el token es inválido, está vencido o fue alterado.
     */
    public TokenValidado validarToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .clock(() -> Date.from(clock.instant()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Object sector = claims.get(CLAIM_SECTOR);
        if (!(sector instanceof Number sectorId)) {
            throw new JwtException("Token sin sector");
        }
        UsuarioAutenticado principal = new UsuarioAutenticado(
                Long.valueOf(claims.getSubject()),
                claims.get(CLAIM_USUARIO, String.class),
                Rol.valueOf(claims.get(CLAIM_ROL, String.class)),
                sectorId.longValue());
        if (claims.getId() == null || claims.getId().isBlank()) {
            throw new JwtException("Token sin id");
        }
        return new TokenValidado(principal, claims.getId(), claims.getExpiration().toInstant());
    }

    public record TokenEmitido(String token, Instant expiraEn) {
    }

    public record TokenValidado(UsuarioAutenticado principal, String jti, Instant expiraEn) {
    }
}
