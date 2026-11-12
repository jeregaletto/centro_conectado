package com.centroconectado.api.common;

import java.time.Clock;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.config.AppProperties;

/**
 * Regla "cada contenido lleva fecha de vigencia y desaparece si nadie lo renueva".
 * Las consultas filtran por vigente_hasta >= ahora, así que vencer = dejar de verse, sin borrar nada.
 */
@Component
public class VigenciaPolicy {

    private final Clock clock;
    private final int porDefectoDias;
    private final int maximaDias;
    private final int avisoVencimientoDias;

    public VigenciaPolicy(Clock clock, AppProperties props) {
        this.clock = clock;
        this.porDefectoDias = props.contenido().vigenciaPorDefectoDias();
        this.maximaDias = props.contenido().vigenciaMaximaDias();
        this.avisoVencimientoDias = props.contenido().avisoVencimientoDias();
    }

    public LocalDateTime resolver(LocalDateTime solicitada) {
        LocalDateTime ahora = LocalDateTime.now(clock);
        if (solicitada == null) {
            return ahora.plusDays(porDefectoDias);
        }
        if (!solicitada.isAfter(ahora)) {
            throw new ReglaNegocioException("La fecha de vigencia tiene que ser futura");
        }
        if (solicitada.isAfter(ahora.plusDays(maximaDias))) {
            throw new ReglaNegocioException("La vigencia máxima es de " + maximaDias
                    + " días. Después se renueva: así nada queda desactualizado.");
        }
        return solicitada;
    }

    public boolean porVencer(LocalDateTime vigenteHasta) {
        return vigenteHasta.isBefore(LocalDateTime.now(clock).plusDays(avisoVencimientoDias));
    }

    public int getAvisoVencimientoDias() {
        return avisoVencimientoDias;
    }
}
