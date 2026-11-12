# Pendientes para el backend y la documentación

La migración no tocó el backend. Esto es lo que encontramos y conviene resolver en la API, con la solución transitoria que usa hoy el frontend.

## 1. Marcar un aviso como leído no baja su notificación

**Qué pasa.** `POST /api/avisos/{id}/leido` registra la lectura, pero la notificación "Para leer: …" de ese aviso queda sin leer. La campanita no baja hasta que la persona abre Notificaciones.

**Hoy en el frontend.** Después de marcar el aviso, Inicio busca las notificaciones sin leer cuyo link es `inicio.html?aviso={id}` y las marca una por una (`src/features/inicio/PantallaInicio.tsx`, `marcarAvisoLeido`). Cuesta dos llamadas más y depende del formato del link.

**Propuesta.** En `AvisoService.marcarLeido`, marcar como leídas las notificaciones del usuario con `link` igual al del aviso. Un método `NotificacionRepository.marcarLeidasPorLink(usuarioId, link)` y un test en `CentroConectadoApiTest`.

## 2. Los links de las notificaciones apuntan a las maquetas HTML

**Qué pasa.** El backend arma links como `pedidos.html?id=3`, `buzon.html?gestion=7` o `agenda.html?evento=4`, que ya no existen.

**Hoy en el frontend.** `src/lib/notificaciones.ts` (`rutaDeLink`) los traduce a `/pedidos/3`, `/gestion?seccion=buzon`, `/agenda?evento=4`. Las rutas que empiezan con `/` también las acepta, ya validadas.

**Propuesta.** Cambiar los links en `PedidoService`, `BuzonService`, `AgendaService`, `AvisoService`, `VencimientosService` y `ResumenSemanalService` a las rutas nuevas. Una migración Flyway `V2__links_notificaciones.sql` puede reescribir las notificaciones existentes. El traductor del frontend sigue sirviendo para las viejas.

## 3. "Mis avisos" del referente se filtra por nombre

**Qué pasa.** `AvisoDto` trae `autor` como texto ("Marta Gómez"), sin id. Para mostrarle al referente solo lo que publicó, Publicar compara ese texto con su nombre y apellido. Si dos personas se llaman igual, se mezclan.

**Propuesta.** Agregar `autorId` a `AvisoDto`, o un endpoint `GET /api/avisos/mios` que use el id del token.

## 4. Publicar para otro sector devuelve 403 sin `campos`

**Qué pasa.** Si un referente manda `sectorIds` de otro sector, `AlcancePublicacionService` responde 403 "Como referente solo podés publicar para tu sector", sin indicar el campo.

**Hoy en el frontend.** El referente solo ve su sector, y el schema Zod (`src/features/publicar/schema.ts`) frena cualquier otro con el mensaje debajo de "¿Para quién?". Un 403 que llegue igual se muestra como "Tu rol no tiene permiso para esta acción".

**Propuesta (opcional).** Que sea un 400 con `campos: { sectorIds: "Como referente solo podés publicar para tu sector" }`. Es un error de datos, no de permiso del rol.

## 5. Los documentos del seed apuntan a archivos que no existen

`DataSeeder` carga documentos y protocolos con URL `/docs/<slug>.pdf`, y no hay ningún archivo ahí. "Abrir" da 404. Hay dos caminos: subir los PDF reales a `frontend-next/public/docs/`, o cambiar el seed por URLs `https://` reales. La subida de archivos ya está anotada como fase 2 en `PROMPT_DESARROLLO.md`.

## 6. Configuración y documentación que quedaron viejas

- `backend/src/main/resources/application.yml`: `spring.web.resources.static-locations` todavía incluye `file:../frontend/`, que ya no existe. Hoy no rompe nada (no sirve archivos), pero conviene sacarlo.
- `CORS_ORIGINS` ya no hace falta para el frontend: el navegador nunca llama al backend directo, todo pasa por el servidor de Next. Se puede dejar vacío en producción.
- `backend/README.md` y `GUIA_CONEXION.md` describen las maquetas HTML (`http://localhost:8080/login.html`, `js/api.js`). Hay que actualizarlos para que apunten a `frontend-next/README.md`.

## 7. Cerrar sesión no invalida el token

El logout borra la cookie, pero el JWT sigue siendo válido hasta `expiraEn` (12 h) si alguien lo copió antes. Como el token nunca está al alcance del JavaScript del navegador, el riesgo es bajo. Para cerrarlo del todo hace falta una lista de tokens revocados o refresh tokens, que ya está en la fase 2 de `PROMPT_DESARROLLO.md`.
