package com.centroconectado.api.common.exception;

import org.springframework.http.HttpStatus;

public class AccesoDenegadoException extends ApiException {

    public AccesoDenegadoException(String mensaje) {
        super(HttpStatus.FORBIDDEN, mensaje);
    }
}
