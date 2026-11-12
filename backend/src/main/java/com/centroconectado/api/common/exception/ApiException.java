package com.centroconectado.api.common.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;

public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    /** Errores por campo (clave = nombre del campo del request). Null si el error no es de un campo. */
    public Map<String, String> getCampos() {
        return null;
    }
}
