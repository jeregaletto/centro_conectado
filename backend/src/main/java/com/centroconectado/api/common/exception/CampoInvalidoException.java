package com.centroconectado.api.common.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * Un dato del request no cumple una regla de negocio y se puede señalar en su campo
 * (el frontend muestra el mensaje debajo del input). Responde 400 con `campos`, igual que @Valid.
 */
public class CampoInvalidoException extends ApiException {

    private final Map<String, String> campos;

    public CampoInvalidoException(String campo, String mensaje) {
        super(HttpStatus.BAD_REQUEST, "Revisá los datos ingresados");
        this.campos = Map.of(campo, mensaje);
    }

    @Override
    public Map<String, String> getCampos() {
        return campos;
    }
}
