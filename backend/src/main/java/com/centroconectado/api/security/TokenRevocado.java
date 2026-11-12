package com.centroconectado.api.security;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Token cerrado con logout antes de vencer. Se guarda solo hasta su vencimiento original. */
@Entity
@Table(name = "tokens_revocados")
public class TokenRevocado {

    @Id
    @Column(length = 64)
    private String jti;

    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;

    protected TokenRevocado() {
    }

    public TokenRevocado(String jti, Instant expiraEn) {
        this.jti = jti;
        this.expiraEn = expiraEn;
    }

    public String getJti() {
        return jti;
    }

    public Instant getExpiraEn() {
        return expiraEn;
    }
}
