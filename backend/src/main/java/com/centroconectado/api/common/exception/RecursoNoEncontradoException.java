package com.centroconectado.api.common.exception;

import org.springframework.http.HttpStatus;

public class RecursoNoEncontradoException extends ApiException {

    public RecursoNoEncontradoException(String recurso, Object id) {
        super(HttpStatus.NOT_FOUND, recurso + " " + id + " no existe");
    }

    public RecursoNoEncontradoException(String mensaje) {
        super(HttpStatus.NOT_FOUND, mensaje);
    }
}
