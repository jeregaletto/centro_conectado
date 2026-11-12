# Cómo conectar las maquetas con el backend

Guía paso a paso para tu primera app completa. Al final vas a tener las maquetas funcionando con datos reales, login por rol, y probándolas desde el celular.

## 1. Cómo encaja todo

```
 Celular / tablet / PC                     Tu PC (o un servidor)
┌──────────────────────┐   HTTP + JSON   ┌────────────────────────────────────┐
│ login.html           │ ──────────────► │ Spring Boot  :8080                 │
│ inicio.html          │   Authorization │  /api/**  → controllers → services │
│ mi-puesto.html  ...  │   Bearer <JWT>  │  /*.html  → sirve la carpeta       │
│  └ js/api.js         │ ◄────────────── │            frontend/ (las maquetas)│
│  └ js/sesion.js      │                 │  Flyway → H2 (dev) / PostgreSQL    │
└──────────────────────┘                 └────────────────────────────────────┘
```

- Las maquetas son **HTML estático**. No cambian de tecnología: solo les sumás JavaScript que pide datos a la API y los pinta.
- El backend **sirve también las maquetas** (lee la carpeta `frontend/`). Por eso todo vive en el mismo origen `http://localhost:8080` y no tenés que pelear con CORS.
- El login devuelve un **token JWT**. `api.js` lo guarda y lo manda en cada request. El backend sabe quién sos y qué rol tenés a partir de ese token.

Estructura de la carpeta:

```
centro-conectado/
├── backend/                  ← Spring Boot (Java 21)
│   ├── pom.xml
│   ├── docker-compose.yml    ← PostgreSQL (opcional)
│   └── src/...
├── frontend/                 ← acá van TODAS las maquetas
│   ├── login.html            ← la maqueta nueva, ya conectada
│   ├── _ejemplo-inicio-conectado.html  ← patrón de referencia
│   ├── index.html            ← redirige a login
│   └── js/
│       ├── api.js            ← único cliente HTTP
│       └── sesion.js         ← sesión, protección y menú por rol
├── PROMPT_DESARROLLO.md
└── GUIA_CONEXION.md          ← esta guía
```

## 2. Levantar el backend (sin instalar base de datos)

Necesitás **JDK 21** y **Maven** (o abrir `backend/` en IntelliJ / Spring Tool Suite, que traen Maven).

```bash
cd centro-conectado/backend
mvn verify            # compila y corre el test de punta a punta (≈ 30 s la primera vez)
mvn spring-boot:run   # levanta en http://localhost:8080
```

> Ojo: escribí este backend en un entorno sin acceso a Maven Central, así que **el primer `mvn verify` en tu máquina es la primera compilación real**. Si algo falla, pegame el error y lo corrijo.

Por defecto arranca con el perfil `dev`: base **H2 en un archivo** (`backend/data/`), migraciones Flyway aplicadas y **datos de demo** cargados. Verificá:

- http://localhost:8080/actuator/health → `{"status":"UP"}`
- http://localhost:8080/swagger-ui.html → todos los endpoints, probables desde el navegador (botón *Authorize* con el token del login).

Usuarios de demo, todos con contraseña **`Centro2026!`**:

| Usuario | Rol | Sector |
|---|---|---|
| `direccion` | Dirección | Dirección |
| `comunicacion` | Calidad y comunicación | Calidad y Comunicación |
| `referente.enf` | Referente | Enfermería |
| `enfermero` | Profesional | Enfermería |
| `kinesio` / `referente.kin` | Profesional / Referente | Kinesiología |
| `administracion` | Administrativo | Administración |
| `referente.mae` | Referente | Maestranza |
| `maestranza` | Maestranza (vista simple) | Maestranza |

Para empezar de cero con la base de demo: frená la app y borrá `backend/data/`.

## 3. Poner las maquetas en su lugar

1. Copiá tus maquetas a `frontend/` con estos nombres (son los que usa la barra inferior en `js/sesion.js`):
   `inicio.html`, `mi-puesto.html`, `pedidos.html`, `buzon.html`, `agenda.html`, `quien-es-quien.html`, `biblioteca.html`.
   Si preferís otros nombres, cambialos en `PANTALLAS` dentro de `sesion.js` (un solo lugar).
2. Abrí **http://localhost:8080/login.html**, tocá una línea de color (por ejemplo, Maestranza) y vas a caer en `inicio.html`.

Si abrís `login.html` con doble clic o sin el backend corriendo, entra en **modo demostración**: te muestra cómo se ve la app para ese rol con datos locales. Así podés mostrar la maqueta sin servidor.

## 4. Conectar una maqueta: el patrón de 4 pasos

Mirá `frontend/_ejemplo-inicio-conectado.html`: es una pantalla de Inicio mínima, ya conectada. Todas las demás se conectan igual.

### Paso 1 · Sumar los scripts y proteger la pantalla

Al final del `<body>` de cada maqueta (menos el login):

```html
<script src="js/api.js"></script>
<script src="js/sesion.js"></script>
<script>
  const usuario = Sesion.proteger();                     // sin sesión → vuelve a login.html
  Sesion.pintarNavegacion('#barra-inferior', 'inicio');  // tu <nav> de abajo, con los botones del rol
  Sesion.iniciarContadorNotificaciones('#badge-notif');  // opcional: número de la campanita
</script>
```

`pintarNavegacion` reemplaza los botones de tu barra por los que corresponden al rol: maestranza ve 4 (Inicio, Mi puesto, Pedidos, Buzón); el resto ve Inicio, Agenda, Pedidos, Buzón y Más. Cada botón sale con la clase `tab` y `tab--activa`, así que adaptá esas clases a tu CSS (o cambiá los nombres de clase en `sesion.js`).

### Paso 2 · Darle un `id` a cada placeholder

Donde la maqueta dice `[Nombre]`, `[fecha]` o tiene una lista de ejemplo, poné un contenedor con `id`:

```html
<!-- antes -->
<h1>Hola, [Nombre]</h1>
<div class="tarea">...</div><div class="tarea">...</div>

<!-- después -->
<h1>Hola, <span id="nombre">[Nombre]</span></h1>
<div id="lista-tareas"></div>
```

Conservá **un** ítem de ejemplo como referencia del HTML y borrá el resto: lo vas a generar desde JavaScript.

### Paso 3 · Pedir los datos y pintarlos

```js
const datos = await CentroAPI.inicio.obtener();          // GET /api/inicio
document.getElementById('nombre').textContent = datos.nombre;
```

Para listas, una función que devuelve el HTML de un ítem (copiado de tu maqueta) y `map().join('')`. Siempre con `Sesion.esc()` en lo que viene del servidor.

### Paso 4 · Conectar los botones

Delegación de eventos sobre el contenedor (funciona aunque la lista se vuelva a pintar):

```js
document.getElementById('lista').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-accion]');
  if (!btn) return;
  // llamar a CentroAPI..., y repintar con la respuesta
});
```

## 5. Las cuatro pantallas de tu maqueta, conectadas

Adaptá los selectores (`#...`) a tu HTML.

### Inicio

Ya resuelta en `_ejemplo-inicio-conectado.html`. Un solo request (`GET /api/inicio`) trae: saludo, avisos fijados con `leido`, agenda de hoy, novedades, notificaciones sin leer, pedidos pendientes de tu área y, si tenés tareas, el avance del día.

### Mi puesto (vista de maestranza)

```html
<p id="avance-texto"></p>
<div class="barra-avance"><div id="avance-barra" style="width:0%"></div></div>
<ul id="tareas"></ul>
<section id="referente"></section>
```

```js
const usuario = Sesion.proteger();
Sesion.pintarNavegacion('#barra-inferior', 'miPuesto');
const { esc } = Sesion;

const ICONOS = { banio: '🚻', basura: '🗑️', trapeador: '🧽', silla: '🪑', jabon: '🧴', ventana: '🪟', caja: '📦',
                 carro: '🛒', termometro: '🌡️', pastilla: '💊' }; // o tus SVG

function pintar(mp) {
  document.getElementById('avance-texto').textContent = `Hiciste ${mp.avance.hechas} de ${mp.avance.total}`;
  document.getElementById('avance-barra').style.width = mp.avance.porcentaje + '%';

  document.getElementById('tareas').innerHTML = mp.tareas.map((t) => `
    <li class="tarea ${t.completada ? 'tarea--hecha' : ''}">
      <button type="button" data-tarea="${t.id}" data-hecha="${t.completada}" aria-pressed="${t.completada}">
        <span class="tarea__icono" aria-hidden="true">${ICONOS[t.icono] || '✔️'}</span>
        <span class="tarea__titulo">${esc(t.titulo)}</span>
        ${t.descripcion ? `<span class="tarea__ayuda">${esc(t.descripcion)}</span>` : ''}
        ${t.frecuencia === 'SEMANAL' ? '<span class="tarea__semanal">Esta semana</span>' : ''}
      </button>
    </li>`).join('');

  const r = mp.referente;
  document.getElementById('referente').innerHTML = r ? `
    <h2>¿Dudas? Tu referente</h2>
    <p><strong>${esc(r.nombre)}</strong>, ${esc(r.puesto)}</p>
    ${r.telefono ? `<a class="boton" href="tel:${esc(r.telefono.replace(/\s/g, ''))}">Llamar</a>` : ''}
    ${r.interno ? `<p>Interno ${esc(r.interno)}</p>` : ''}` : '';
}

document.getElementById('tareas').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-tarea]');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  try {
    const id = btn.dataset.tarea;
    const mp = btn.dataset.hecha === 'true'
      ? await CentroAPI.miPuesto.desmarcar(id)
      : await CentroAPI.miPuesto.completar(id);
    pintar(mp);                       // el backend devuelve la pantalla entera actualizada
  } catch (err) {
    btn.disabled = false;
    btn.querySelector('.tarea__titulo').insertAdjacentHTML('afterend', `<span class="error">${esc(err.message)}</span>`);
  }
});

CentroAPI.miPuesto.obtener().then(pintar);
```

### Pedidos (recibidos / enviados)

```html
<div role="tablist">
  <button role="tab" id="tab-recibidos" aria-selected="true">Recibidos</button>
  <button role="tab" id="tab-enviados" aria-selected="false">Enviados</button>
</div>
<ul id="lista-pedidos"></ul>

<form id="form-pedido">
  <select id="p-tipo"><option value="PEDIDO">Pedido</option><option value="INTERCONSULTA">Interconsulta</option></select>
  <select id="p-destino" required></select>
  <input id="p-asunto" required maxlength="150">
  <textarea id="p-detalle" required maxlength="2000"></textarea>
  <small>No escribas nombres ni DNI de pacientes.</small>
  <select id="p-prioridad"><option value="MEDIA">Normal (72 h)</option><option value="ALTA">Alta (24 h)</option><option value="BAJA">Baja (7 días)</option></select>
  <button type="submit">Enviar pedido</button>
  <p id="p-error" role="alert"></p>
</form>
```

```js
const usuario = Sesion.proteger();
Sesion.pintarNavegacion('#barra-inferior', 'pedidos');
const { esc, fmt } = Sesion;
const ESTADO = { PENDIENTE: 'Pendiente', EN_CURSO: 'En curso', RESUELTO: 'Resuelto', RECHAZADO: 'Rechazado', CANCELADO: 'Cancelado' };
let pestaña = 'recibidos';

function plazoTexto(p) {
  if (p.horasRestantes === null) return `Cerrado el ${fmt.fecha(p.cerradoEn)}`;
  if (p.vencido) return `Vencido hace ${Math.abs(p.horasRestantes)} h`;
  return p.horasRestantes < 24 ? `Vence en ${p.horasRestantes} h` : `Vence el ${fmt.fecha(p.plazo)}`;
}

async function cargar() {
  const lista = pestaña === 'recibidos' ? await CentroAPI.pedidos.recibidos() : await CentroAPI.pedidos.enviados();
  const otra = (p) => pestaña === 'recibidos' ? `De ${esc(p.sectorOrigen.nombre)}` : `Para ${esc(p.sectorDestino.nombre)}`;
  document.getElementById('lista-pedidos').innerHTML = lista.length ? lista.map((p) => `
    <li class="pedido ${p.vencido ? 'pedido--vencido' : ''}">
      <a href="pedido.html?id=${p.id}">
        <span class="pedido__codigo">${esc(p.codigo)}</span>
        <strong>${esc(p.asunto)}</strong>
        <span>${otra(p)}</span>
        <span class="estado estado--${p.estado.toLowerCase()}">${ESTADO[p.estado]}</span>
        <span>${plazoTexto(p)}</span>
      </a>
    </li>`).join('')
    : `<li class="vacio">${pestaña === 'recibidos' ? 'Tu área no tiene pedidos.' : 'Todavía no hiciste pedidos.'}</li>`;
}

['recibidos', 'enviados'].forEach((t) => document.getElementById('tab-' + t).addEventListener('click', () => {
  pestaña = t;
  document.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.id === 'tab-' + t)));
  cargar();
}));

// Combo de áreas destino (todas menos la propia)
CentroAPI.directorio.sectores().then((sectores) => {
  document.getElementById('p-destino').innerHTML = sectores
    .filter((s) => s.id !== usuario.sector.id)
    .map((s) => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
});

document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  try {
    await CentroAPI.pedidos.crear({
      tipo: document.getElementById('p-tipo').value,
      sectorDestinoId: Number(document.getElementById('p-destino').value),
      asunto: document.getElementById('p-asunto').value,
      detalle: document.getElementById('p-detalle').value,
      prioridad: document.getElementById('p-prioridad').value,
    });
    e.target.reset();
    pestaña = 'enviados'; document.getElementById('tab-enviados').click();
  } catch (err) {
    document.getElementById('p-error').textContent =
      err.campos ? Object.values(err.campos).join('. ') : err.message;
  } finally { btn.disabled = false; }
});

cargar();
```

En el detalle (`pedido.html?id=…`), `CentroAPI.pedidos.detalle(id)` trae `historial`, `puedoCambiarEstado` y `puedoCancelar`: usalos para mostrar u ocultar los botones *Tomar* (`EN_CURSO`), *Resolver*, *Rechazar* (pide motivo) y *Cancelar*, que llaman a `CentroAPI.pedidos.cambiarEstado(id, estado, comentario)`.

### Buzón (con anónimo y seguimiento)

```html
<form id="form-buzon">
  <fieldset>
    <legend>¿Qué querés enviar?</legend>
    <label><input type="radio" name="tipo" value="CONSULTA" checked> Consulta</label>
    <label><input type="radio" name="tipo" value="SUGERENCIA"> Sugerencia</label>
    <label><input type="radio" name="tipo" value="RECLAMO"> Reclamo</label>
  </fieldset>
  <input id="b-asunto" required maxlength="150">
  <textarea id="b-cuerpo" required maxlength="4000"></textarea>
  <label><input type="checkbox" id="b-anonimo"> Enviar sin mi nombre</label>
  <button type="submit">Enviar</button>
</form>
<section id="b-confirmacion" hidden></section>
<ul id="b-mios"></ul>
```

```js
Sesion.proteger();
Sesion.pintarNavegacion('#barra-inferior', 'buzon');
const { esc, fmt } = Sesion;
const CLAVE = 'cc.buzon.codigos';
const codigosAnonimos = () => JSON.parse(localStorage.getItem(CLAVE) || '[]');
const ESTADO = { RECIBIDO: 'Recibido', EN_REVISION: 'En revisión', RESPONDIDO: 'Respondido', CERRADO: 'Cerrado' };

const item = (m) => `
  <li class="mensaje-buzon">
    <strong>${esc(m.asunto)}</strong> ${m.anonimo ? '<span>(anónimo)</span>' : ''}
    <span class="estado">${ESTADO[m.estado]}</span>
    ${m.respuesta
      ? `<p class="respuesta">${esc(m.respuesta)}</p>`
      : `<small>${m.vencido ? 'Fuera de plazo: ya se avisó a Dirección' : 'Respuesta antes del ' + fmt.fecha(m.plazoRespuesta)}</small>`}
  </li>`;

async function cargarMios() {
  const conNombre = await CentroAPI.buzon.mios();
  // Los anónimos no están vinculados a tu usuario: se consultan por el código guardado en este celular.
  const anonimos = await Promise.all(codigosAnonimos().map((c) => CentroAPI.buzon.seguimiento(c).catch(() => null)));
  const todos = conNombre.concat(anonimos.filter(Boolean)).sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  document.getElementById('b-mios').innerHTML = todos.length ? todos.map(item).join('')
    : '<li class="vacio">Todavía no enviaste mensajes.</li>';
}

document.getElementById('form-buzon').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  try {
    const m = await CentroAPI.buzon.enviar({
      tipo: document.querySelector('input[name=tipo]:checked').value,
      asunto: document.getElementById('b-asunto').value,
      cuerpo: document.getElementById('b-cuerpo').value,
      anonimo: document.getElementById('b-anonimo').checked,
    });
    if (m.anonimo) localStorage.setItem(CLAVE, JSON.stringify([m.codigoSeguimiento, ...codigosAnonimos()]));
    const conf = document.getElementById('b-confirmacion');
    conf.hidden = false;
    conf.innerHTML = `<h2>Enviado</h2>
      <p>Te respondemos antes del ${fmt.fechaLarga(m.plazoRespuesta)}.</p>
      ${m.anonimo ? `<p>Tu código de seguimiento es <strong style="font-size:1.5em;letter-spacing:.1em">${esc(m.codigoSeguimiento)}</strong>. Anotalo: es la única forma de ver la respuesta desde otro dispositivo.</p>` : ''}`;
    e.target.reset();
    cargarMios();
  } catch (err) {
    alertaEnPantalla(err.message);
  } finally { btn.disabled = false; }
});

function alertaEnPantalla(texto) {
  const conf = document.getElementById('b-confirmacion');
  conf.hidden = false; conf.innerHTML = `<p role="alert">${esc(texto)}</p>`;
}

cargarMios();
```

## 6. Probar desde el celular

1. Celular y PC en **la misma wifi**.
2. En la PC: `ipconfig` (Windows) → anotá la *Dirección IPv4*, por ejemplo `192.168.0.25`.
3. Permití el puerto en el firewall de Windows (PowerShell como administrador):
   ```powershell
   New-NetFirewallRule -DisplayName "Centro Conectado 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private
   ```
4. En el celular: `http://192.168.0.25:8080/login.html`.
5. Para la sala de descanso: generá un QR con esa URL y pegalo junto a la cartelería.

## 7. Pasar a PostgreSQL

```bash
cd backend
docker compose up -d                                         # PostgreSQL 16 en :5432
mvn spring-boot:run -Dspring-boot.run.profiles=postgres      # misma app, otra base
```

Flyway crea las tablas solo. Si la base está vacía y `APP_SEED=true` (default), carga la demo. Podés conectarte con DBeaver a `localhost:5432`, base `centro_conectado`, usuario `centro`, clave `centro_dev_2026`.

**Cambios de esquema**: nunca edites `V1__esquema_inicial.sql` una vez aplicado. Creá `V2__descripcion.sql` con el `ALTER TABLE` y Flyway lo aplica al arrancar.

## 8. Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| `No hay conexión con el servidor` en el login | El backend no está corriendo o estás en otra red. Probá `http://localhost:8080/actuator/health`. |
| Error de **CORS** en la consola | Abriste las maquetas con Live Server (puerto 5500) u otro origen. Usá `http://localhost:8080/...` o agregá tu origen en `CORS_ORIGINS`. |
| Te devuelve al login todo el tiempo | El token venció (12 h) o el backend se reinició con otro `JWT_SECRET`. Volvé a ingresar. |
| `403 Tu rol no tiene permiso` | Correcto: el backend bloquea la acción para ese rol. Ocultá el botón con `Sesion.tiene(usuario, 'PERMISO')`. |
| `Port 8080 was already in use` | Otra app usa el puerto. Cerrala o arrancá con `PORT=8081`. |
| Cambiaste datos de demo y no se ven | El seed solo corre con la base vacía. Borrá `backend/data/` (H2) o `docker compose down -v` (PostgreSQL). |
| Las maquetas no se encuentran (404) | Tienen que estar en `centro-conectado/frontend/` y el backend tiene que arrancarse desde `backend/` (lee `../frontend/`). |

## 9. Antes de usarlo con el personal real

- **HTTPS obligatorio**: las contraseñas viajan por la red. Publicalo detrás de un proxy con certificado (Caddy o Nginx + Let's Encrypt) o en un PaaS que lo dé (Railway, Render, Fly.io).
- Definí `JWT_SECRET` propio (`openssl rand -base64 48`) y `APP_SEED=false`.
- Cargá usuarios reales desde `POST /api/admin/usuarios` (Swagger con el usuario de Dirección): se crean con `debeCambiarPassword=true` y el login les pide elegir su contraseña.
- Backup diario de PostgreSQL (`pg_dump`).
- La tablet compartida: **sin** "Mantener la sesión"; la sesión se borra al cerrar el navegador.
