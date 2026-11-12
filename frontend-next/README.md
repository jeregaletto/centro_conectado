# Centro Conectado · frontend (Next.js)

Web app interna del Centro: avisos, agenda, Mi puesto, pedidos entre áreas, buzón, quién es quién, biblioteca y gestión. Cada persona ve una versión distinta según su rol. Habla con la API Spring Boot de `../backend` sin modificar su contrato.

Next.js 16 (App Router, Cache Components) · TypeScript strict · Tailwind CSS 4 · Zustand · Zod · Vitest · Playwright.

## Cómo correrlo

Necesitás Node 22 y el backend levantado (perfil `dev`, con los datos de demo):

```bash
cd backend && mvn spring-boot:run          # http://localhost:8080
```

En otra terminal:

```bash
cd frontend-next
npm install
npm run dev                                 # http://localhost:3000
```

Entrá a http://localhost:3000/login. En desarrollo aparecen las "líneas de piso" para entrar con un rol de prueba. Todos los usuarios de demo usan la contraseña `Centro2026!`: `direccion`, `comunicacion`, `referente.enf`, `enfermero`, `kinesio`, `referente.kin`, `administracion`, `referente.mae`, `maestranza`.

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build de producción y servidor |
| `npm run typecheck` | Tipos de rutas (`next typegen`) y `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest: permisos, fechas, rutas, cliente HTTP, schemas Zod |
| `npm run test:e2e` | Playwright contra el backend real y el build (`npm run build` antes) |

Todo junto, como en CI:

```bash
npm run build && npm run typecheck && npm test && npm run test:e2e
```

Para los e2e, la primera vez instalá el navegador con `npx playwright install chromium`. Los tests crean avisos de prueba y los borran al terminar. Tildan una tarea de maestranza y la destildan. Las capturas de cada ruta quedan en `tests/e2e/capturas/`.

### Variables de entorno

| Variable | Default | Para qué |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` | Dónde está la API. La usan el servidor de Next y el proxy; el navegador nunca habla directo con el backend. |
| `MODO_DEMO` | `true` en desarrollo, `false` en producción | Muestra las líneas de piso por rol en el login y la vista previa sin servidor. |
| `COOKIE_SECURE` | `true` en producción | Poné `false` solo para probar el build desde el celular por `http://IP:3000`. En producción la app va por HTTPS. |

### Probar desde el celular

Celular y PC en la misma wifi. Corré `npm run dev -- -H 0.0.0.0` y entrá a `http://<IP de la PC>:3000/login`. Si probás el build de producción por http, agregá `COOKIE_SECURE=false`.

## Cómo está armado

```
app/
  (publico)/login/           login, cambio de contraseña y modo demo
  (app)/                     pantallas protegidas: layout con la sesión, barra por rol y campanita
  api/session/route.ts       POST login (setea la cookie) · DELETE logout
  api/proxy/[...path]/       proxy del navegador al backend (agrega Authorization desde la cookie)
proxy.ts                     sin cookie → /login?volver=...   (ex middleware.ts, ver abajo)
src/lib/api/                 cliente HTTP (navegador y servidor), errores, un archivo de endpoints por módulo
src/lib/permisos.ts          tiene(), menuPara(), menuMas(), secciones de Gestión
src/lib/fechas.ts            formateo es-AR sin conversiones de zona
src/lib/tipos.ts             tipos de todos los DTOs del backend
src/features/<pantalla>/     componentes, hooks y schema Zod de cada pantalla
src/components/ui/           Boton, Campo, Mensaje, Tarjeta, BarraInferior, Icono, ...
src/stores/usuario.ts        Zustand: usuario y notificaciones sin leer
```

Cada pantalla carga sus datos en un Server Component, que lee la cookie y llama directo al backend. Las acciones (tildar, enviar, filtrar) van en Client Components y pasan por `/api/proxy`. Los datos del servidor no se guardan en estado global: Zustand solo tiene el usuario y el contador de la campanita.

### Seguridad

- **El JWT nunca llega al JavaScript del navegador.** `POST /api/session` llama al login del backend y guarda el token en la cookie `cc_token`, con `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Con "Mantener la sesión" la cookie vence en `expiraEn`, igual que el JWT. Sin tildar es una cookie de sesión: se borra al cerrar el navegador, pensado para la tablet compartida.
- **Proxy:** valida los segmentos de la ruta (nada de `..` ni `%2F`), rechaza pedidos que no son GET si vienen de otro origen (defensa contra CSRF además de SameSite) y borra la cookie si el backend responde 401.
- **`proxy.ts` solo mira que exista la cookie.** La autorización real la hace el backend en cada llamada. Esconder un botón no es control de acceso: `/publicar` y `/gestion` además redirigen a Inicio en el servidor si faltan permisos.
- **`volver`** solo acepta rutas propias (`src/lib/rutas.ts`, con tests).
- Todo lo que viene del servidor se muestra como texto de React; no se usa `dangerouslySetInnerHTML`. Lo único que va a `localStorage` son los códigos de seguimiento del buzón anónimo (`cc.buzon.codigos`).
- No hay ningún campo ni tipo para datos de pacientes. Pedidos muestra el recordatorio "No escribas nombres ni DNI de pacientes".

### Decisiones que conviene saber

- **`proxy.ts` en lugar de `middleware.ts`.** En Next 16 `middleware.ts` está deprecado y renombrado a `proxy.ts`, con el mismo comportamiento. Con el nombre viejo, el build muestra una advertencia de deprecación.
- **Cache Components está activado.** Todo lo que lee la cookie va dentro de un `<Suspense>` (layout y `loading.tsx`). Lo que depende del momento del pedido, como "hoy" en Agenda, se calcula después de `connection()`.
- **Fechas:** la API devuelve horas "de reloj" de Buenos Aires sin zona y `fechas.ts` las muestra tal cual. Las fechas sin hora son ese día, no el anterior (el bug de la versión HTML tiene un test).
- **Errores:** si el backend devuelve `campos`, cada mensaje va debajo de su campo; si no, arriba del formulario. Un 403 se muestra siempre como "Tu rol no tiene permiso para esta acción". Los schemas Zod usan los mismos textos que el backend.
- **Rutas con el router de Next en dev:** `next.config.ts` reenvía `/api/*` al backend como `fallback` (excepto `proxy` y `session`). La app no lo usa; sirve para probar endpoints a mano.

Lo que la API no da todavía, o conviene cambiar, está en [PENDIENTES.md](PENDIENTES.md).
