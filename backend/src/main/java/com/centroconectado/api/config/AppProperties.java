package com.centroconectado.api.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String zonaHoraria,
        boolean seed,
        Jwt jwt,
        Cors cors,
        Buzon buzon,
        Contenido contenido,
        Login login) {

    public record Jwt(String secret, int expiracionHoras) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Buzon(int plazoRespuestaHoras) {
    }

    public record Contenido(int vigenciaPorDefectoDias, int vigenciaMaximaDias, int avisoVencimientoDias) {
    }

    public record Login(int maxIntentos, int bloqueoMinutos) {
    }
}
