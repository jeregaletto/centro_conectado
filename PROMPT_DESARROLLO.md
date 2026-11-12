# Prompt de desarrollo · Centro Conectado

> Copiá este prompt completo cuando le pidas a una IA (o a otra persona del equipo) que conecte o extienda las maquetas. Está escrito para que el resultado sea consistente con el backend que ya existe en `backend/`.

---

## Rol

Actuá como desarrollador full-stack senior. Vas a integrar un conjunto de maquetas HTML/CSS/JS mobile-first con una API REST en Spring Boot 3 que ya está implementada. No reescribas el backend salvo que se indique; si encontrás algo que falta, proponelo como cambio puntual (entidad + migración Flyway + servicio + controller + test).

## Producto

**Centro Conectado**: una sola web app, abierta desde el celular sin instalar nada, que es la fuente única de información interna de un centro de salud. Cada persona ve una versión distinta según su rol. Lo oficial va por la app; WhatsApp queda solo para lo urgente. **No se cargan datos de pacientes** (ni nombres, ni DNI, ni historia clínica): si un pedido necesita referirse a un paciente se usa "habitación 12" o "ver HC".

## Roles y vistas

| Rol | Vista | Puede además |
|---|---|---|
| `DIRECCION` | Completa | Todo: publicar para cualquier sector, ver lecturas, buzón, biblioteca, usuarios, tablero de pedidos |
| `COMUNICACION` (calidad/comunicación, responsable general) | Completa | Igual que Dirección, salvo crear/editar usuarios de Dirección |
| `REFERENTE` (uno por sector) | Completa | Publicar avisos y eventos **solo para su sector**, armar el checklist de su sector y ver el avance, ver lecturas de lo que publicó |
| `PROFESIONAL`, `ADMINISTRATIVO` | Completa | Lo básico |
| `MAESTRANZA` | **Simple**: íconos grandes, texto breve, 4 botones | Lo básico |

Lo básico para todos: leer y confirmar avisos, ver agenda, tildar tareas de Mi puesto, crear y seguir pedidos entre áreas, escribir al buzón (opcionalmente anónimo), consultar Quién es quién y Biblioteca.

El frontend decide qué mostrar con `usuario.vista` y `usuario.permisos` (vienen en el login y en `GET /api/auth/me`). **La seguridad real la aplica el backend**: esconder un botón no es control de acceso.

## Pantallas (maquetas) y su endpoint

| Pantalla | Archivo | Endpoint principal |
|---|---|---|
| Login por roles | `login.html` (hecha) | `POST /api/auth/login`, `POST /api/auth/cambiar-password` |
| Inicio | `inicio.html` | `GET /api/inicio` (todo en un request) · `POST /api/avisos/{id}/leido` |
| Agenda | `agenda.html` | `GET /api/agenda?desde=&hasta=` · `GET /api/agenda/{id}/ics` |
| Mi puesto | `mi-puesto.html` | `GET /api/mi-puesto` · `POST/DELETE /api/mi-puesto/tareas/{id}/completar` |
| Pedidos | `pedidos.html` | `GET /api/pedidos/recibidos`, `/enviados`, `/{id}` · `POST /api/pedidos` · `PATCH /api/pedidos/{id}/estado` · `POST /api/pedidos/{id}/comentarios` |
| Buzón | `buzon.html` | `POST /api/buzon` · `GET /api/buzon/mios` · `GET /api/buzon/seguimiento/{codigo}` |
| Quién es quién | `quien-es-quien.html` | `GET /api/directorio?q=` · `GET /api/sectores` · `GET /api/a-quien-acudir` |
| Biblioteca | `biblioteca.html` | `GET /api/biblioteca?categoria=&q=` |
| Publicar (referentes y gestión) | `publicar.html` | `POST /api/avisos` · `POST /api/agenda` · `GET /api/avisos/{id}/lecturas` |
| Gestión | `gestion.html` | `GET /api/buzon/gestion` · `POST /api/buzon/{id}/responder` · `GET /api/puesto/avance` · `GET /api/avisos/por-vencer` · `/api/admin/**` |

Contrato completo: Swagger en `http://localhost:8080/swagger-ui.html`.

## Reglas de integración (obligatorias)

1. **Un solo cliente HTTP.** Toda llamada pasa por `js/api.js` (`CentroAPI.*`). Nada de `fetch` sueltos en las pantallas. Si falta un endpoint en `api.js`, se agrega ahí.
2. **Cada pantalla protegida empieza igual:**
   ```html
   <script src="js/api.js"></script>
   <script src="js/sesion.js"></script>
   <script>
     const usuario = Sesion.proteger();               // sin sesión → login.html
     Sesion.pintarNavegacion('#barra-inferior', 'pedidos');
     Sesion.iniciarContadorNotificaciones('#badge-notif');
   </script>
   ```
3. **Navegación por rol desde un único lugar**: `Sesion.menuPara(usuario)` y `Sesion.menuMas(usuario)`. No duplicar la lógica de roles en cada HTML.
4. **Placeholders**: todo texto entre corchetes (`[fecha]`, `[sector]`, `[Nombre]`) se reemplaza con datos de la API. Si una lista viene vacía, se muestra un estado vacío que diga qué hacer ("Todavía no hiciste pedidos. Tocá Nuevo pedido para empezar.").
5. **Escapar siempre** lo que viene del servidor antes de usar `innerHTML`: `Sesion.esc(texto)`. Preferir `textContent` cuando no hace falta HTML.
6. **Errores**: el backend siempre responde `{ status, mensaje, campos }`. Mostrar `err.message`; si hay `err.campos`, marcar cada input con su mensaje. Un 401 ya redirige solo a `login.html`. Sin `alert()`.
7. **Estados de carga**: botón con `aria-busy="true"` y deshabilitado mientras espera; nunca doble envío.
8. **Fechas**: la API usa ISO local (`2026-11-12T14:00:00`, hora argentina). Formatear con `Sesion.fmt.fecha/hora/fechaLarga`. Para inputs usar `type="date"` y `type="datetime-local"`, que ya mandan el formato correcto.
9. **Vista SIMPLE (maestranza)**: `document.documentElement.dataset.vista === 'SIMPLE'`. Tipografía más grande (≥19 px), objetivos táctiles ≥ 56 px, íconos con texto breve, sin tablas ni menús anidados.
10. **Accesibilidad mínima**: foco visible, `aria-live` en mensajes, `aria-current="page"` en la pestaña activa, contraste AA.
11. **Sin datos de pacientes** en ningún formulario. Agregar un texto de ayuda en Pedidos: "No escribas nombres ni DNI de pacientes".

## Reglas de negocio que el frontend tiene que reflejar

- **Avisos**: `fijado` o `requiereLectura && !leido` van arriba en Inicio con botón "Marcar como leído". Tipos: `NOVEDAD`, `CAMBIO_HORARIO`, `URGENTE` (los dos últimos generan notificación al sector).
- **Vigencia**: todo aviso y documento tiene `vigenteHasta` (por defecto 30 días, máximo 180). Al vencer deja de verse. Quien publicó recibe aviso 3 días antes y puede **Renovar** (`POST /api/avisos/{id}/renovar`). Si `porVencer: true`, mostrar una marca en la vista de gestión.
- **Pedidos**: estados `PENDIENTE → EN_CURSO → RESUELTO | RECHAZADO`, o `CANCELADO` por quien pidió. Solo el área destino cambia estado; rechazar exige motivo. Plazo por prioridad: ALTA 24 h, MEDIA 72 h, BAJA 7 días. Mostrar `vencido` y `horasRestantes`. Usar `puedoCambiarEstado` y `puedoCancelar` del detalle para habilitar botones.
- **Buzón**: plazo de respuesta 72 h. Si `anonimo: true`, el backend **no guarda autor ni sector**; la única forma de seguirlo es el `codigoSeguimiento`. El frontend lo muestra grande al enviar ("Anotá este código") y lo guarda en `localStorage` (`cc.buzon.codigos`) para listar "Mis mensajes anónimos" en ese dispositivo.
- **Mi puesto**: tareas `DIARIA` (se reinician cada día) y `SEMANAL` (cada lunes). Tildar = `POST`, destildar = `DELETE`; ambas devuelven el `MiPuestoDto` completo para repintar. Mostrar avance (`hechas/total`) y el contacto del referente.
- **Notificaciones**: in-app, contador cada 60 s. El lunes 8:00 llega el resumen semanal.
- **Agenda**: botón "Agregar a mi calendario" con `CentroAPI.agenda.descargarIcs(id)` (el celular pone el recordatorio).

## Stack y arquitectura del backend (ya hecho)

- Java 21, Spring Boot 3.5, Spring Security con JWT stateless (12 h), Spring Data JPA, Flyway, PostgreSQL 16 (H2 en desarrollo), springdoc.
- Paquetes por módulo: `usuarios`, `avisos`, `agenda`, `notificaciones`, `puesto`, `pedidos`, `buzon`, `biblioteca`, `inicio`, `jobs`. Cada uno con entidad → repository → service (reglas y permisos) → controller (solo HTTP) → DTOs `record`.
- Excepciones de dominio (`RecursoNoEncontradoException`, `ReglaNegocioException`, `AccesoDenegadoException`…) y un `GlobalExceptionHandler` con formato único.
- Permisos con `@PreAuthorize` en controllers + reglas de alcance (sector propio) en services.
- Jobs: recordatorios de agenda (cada minuto), vencimientos (7:00), resumen semanal (lunes 8:00).

## Definición de terminado para cada pantalla

- [ ] Sin placeholders entre corchetes visibles con el backend levantado.
- [ ] Probada con al menos dos roles (uno `COMPLETA`, `maestranza`).
- [ ] Estados: cargando, vacío, error y sin conexión.
- [ ] Ningún `fetch` fuera de `api.js`; ningún `innerHTML` sin `Sesion.esc`.
- [ ] Funciona a 360 px de ancho y en la tablet.
- [ ] Si se tocó el backend: migración Flyway nueva (nunca editar una ya aplicada) y `mvn verify` en verde.

## Fase 2 (no hacer ahora, dejar preparado)

- Web Push (VAPID) para notificaciones con la app cerrada: se engancha en `NotificacionService.notificar`, único punto de emisión.
- PWA (manifest + service worker) para "Agregar a pantalla de inicio" y lectura offline de la Biblioteca.
- Subida de PDFs a la Biblioteca (hoy se guarda una URL).
- Modo cartelera para la tablet de la sala de descanso: endpoint de solo lectura con avisos generales y agenda del día, rotando en pantalla completa.
- Refresh token o cookie `HttpOnly` si se publica fuera de la red interna.
