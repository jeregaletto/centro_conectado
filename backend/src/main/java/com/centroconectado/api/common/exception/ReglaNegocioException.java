package com.centroconectado.api.common.exception;

import org.springframework.http.HttpStatus;

public class ReglaNegocioException extends ApiException {

    public ReglaNegocioException(String mensaje) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, mensaje);
    }
}
