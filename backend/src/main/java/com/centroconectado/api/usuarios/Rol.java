package com.centroconectado.api.usuarios;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum Rol {

    DIRECCION("Dirección", Vista.COMPLETA, EnumSet.allOf(Permiso.class)),
    COMUNICACION("Calidad y comunicación", Vista.COMPLETA, EnumSet.allOf(Permiso.class)),
    REFERENTE("Referente de sector", Vista.COMPLETA,
            EnumSet.of(Permiso.PUBLICAR_SECTOR, Permiso.GESTIONAR_TAREAS_SECTOR, Permiso.VER_LECTURAS)),
    PROFESIONAL("Profesional", Vista.COMPLETA, EnumSet.noneOf(Permiso.class)),
    ADMINISTRATIVO("Administrativo", Vista.COMPLETA, EnumSet.noneOf(Permiso.class)),
    MAESTRANZA("Maestranza", Vista.SIMPLE, EnumSet.noneOf(Permiso.class));

    private final String etiqueta;
    private final Vista vista;
    private final Set<Permiso> permisos;

    Rol(String etiqueta, Vista vista, Set<Permiso> permisos) {
        this.etiqueta = etiqueta;
        this.vista = vista;
        this.permisos = Collections.unmodifiableSet(permisos);
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public Vista getVista() {
        return vista;
    }

    public Set<Permiso> getPermisos() {
        return permisos;
    }
}
