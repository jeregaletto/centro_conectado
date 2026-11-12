package com.centroconectado.api.common.exception;

import org.springframework.http.HttpStatus;

public class NoAutenticadoException extends ApiException {

    public NoAutenticadoException(String mensaje) {
        super(HttpStatus.UNAUTHORIZED, mensaje);
    }
}
