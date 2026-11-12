package com.centroconectado.api.security;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logout real con JWT stateless: el id del token (jti) queda en una lista de revocados hasta que vence.
 * El filtro JWT consulta esta lista en cada request.
 */
@Service
public class RevocacionTokenService {

    private final TokenRevocadoRepository repository;
    private final Clock clock;

    public RevocacionTokenService(TokenRevocadoRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public void revocar(String jti, Instant expiraEn) {
        if (jti != null && !repository.existsById(jti)) {
            repository.save(new TokenRevocado(jti, expiraEn));
        }
    }

    @Transactional(readOnly = true)
    public boolean estaRevocado(String jti) {
        return jti != null && repository.existsById(jti);
    }

    /** Los vencidos ya no sirven de todos modos: se borran para que la tabla no crezca. */
    @Transactional
    public int limpiarVencidos() {
        return repository.borrarVencidos(clock.instant());
    }
}
