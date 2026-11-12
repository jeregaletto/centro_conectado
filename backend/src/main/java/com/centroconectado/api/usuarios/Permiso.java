package com.centroconectado.api.usuarios;

public enum Permiso {
    /** Publicar avisos y eventos para cualquier sector o para todo el Centro. */
    PUBLICAR_GENERAL,
    /** Publicar avisos y eventos solo para el propio sector (referentes). */
    PUBLICAR_SECTOR,
    /** Ver quién leyó un aviso. */
    VER_LECTURAS,
    /** ABM de tareas de puesto de cualquier sector. */
    GESTIONAR_TAREAS_GENERAL,
    /** ABM de tareas de puesto del propio sector. */
    GESTIONAR_TAREAS_SECTOR,
    /** Leer y responder el buzón. */
    GESTIONAR_BUZON,
    /** Publicar y renovar documentos de la biblioteca. */
    GESTIONAR_BIBLIOTECA,
    /** Alta, baja y cambio de rol de usuarios; asignar referentes. */
    GESTIONAR_USUARIOS,
    /** Ver pedidos de todos los sectores (tablero de dirección). */
    VER_TODOS_LOS_PEDIDOS
}
