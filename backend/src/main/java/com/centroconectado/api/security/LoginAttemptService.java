package com.centroconectado.api.security;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.centroconectado.api.config.AppProperties;

/**
 * Bloqueo temporal tras N intentos fallidos por usuario. En memoria: alcanza para una instancia.
 * Si escalás a varias instancias, moverlo a Redis.
 */
@Service
public class LoginAttemptService {

    private final Map<String, Intentos> intentos = new ConcurrentHashMap<>();
    private final int maxIntentos;
    private final int bloqueoMinutos;
    private final Clock clock;

    public LoginAttemptService(AppProperties props, Clock clock) {
        this.maxIntentos = props.login().maxIntentos();
        this.bloqueoMinutos = props.login().bloqueoMinutos();
        this.clock = clock;
    }

    public boolean estaBloqueado(String usuario) {
        Intentos i = intentos.get(clave(usuario));
        if (i == null || i.bloqueadoHasta() == null) {
            return false;
        }
        if (clock.instant().isAfter(i.bloqueadoHasta())) {
            intentos.remove(clave(usuario));
            return false;
        }
        return true;
    }

    public void registrarFallo(String usuario) {
        intentos.compute(clave(usuario), (k, actual) -> {
            int cantidad = actual == null ? 1 : actual.cantidad() + 1;
            Instant bloqueo = cantidad >= maxIntentos
                    ? clock.instant().plus(bloqueoMinutos, ChronoUnit.MINUTES)
                    : null;
            return new Intentos(cantidad, bloqueo);
        });
    }

    public void registrarExito(String usuario) {
        intentos.remove(clave(usuario));
    }

    public int getBloqueoMinutos() {
        return bloqueoMinutos;
    }

    private String clave(String usuario) {
        return usuario == null ? "" : usuario.trim().toLowerCase();
    }

    private record Intentos(int cantidad, Instant bloqueadoHasta) {
    }
}
