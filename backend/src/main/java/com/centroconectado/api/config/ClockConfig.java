package com.centroconectado.api.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Reloj único de la aplicación en hora argentina. Inyectarlo (en vez de usar LocalDateTime.now())
 * permite testear vencimientos y recordatorios fijando la fecha.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock(AppProperties props) {
        return Clock.system(ZoneId.of(props.zonaHoraria()));
    }
}
