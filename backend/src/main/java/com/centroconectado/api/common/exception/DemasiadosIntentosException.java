package com.centroconectado.api.common.exception;

import org.springframework.http.HttpStatus;

public class DemasiadosIntentosException extends ApiException {

    public DemasiadosIntentosException(String mensaje) {
        super(HttpStatus.TOO_MANY_REQUESTS, mensaje);
    }
}
