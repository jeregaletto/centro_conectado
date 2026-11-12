# Centro Conectado · API

Spring Boot 3.5 · Java 21 · JWT · JPA · Flyway · PostgreSQL (H2 en dev) · Swagger.

```bash
mvn verify                 # compila + test de punta a punta sobre H2
mvn spring-boot:run        # perfil dev (H2 + datos demo) → http://localhost:8080
docker compose up -d && mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

- Swagger: http://localhost:8080/swagger-ui.html
- Maquetas: http://localhost:8080/login.html (se sirven desde `../frontend/`)
- Usuarios demo: `direccion`, `comunicacion`, `referente.enf`, `enfermero`, `kinesio`, `referente.kin`, `administracion`, `referente.mae`, `maestranza` · clave `Centro2026!`

## Módulos

| Paquete | Qué resuelve | Base path |
|---|---|---|
| `usuarios` | Login JWT, roles/permisos, directorio, organigrama, a quién acudir, ABM de usuarios | `/api/auth`, `/api/directorio`, `/api/sectores`, `/api/a-quien-acudir`, `/api/admin` |
| `avisos` | Novedades, cambios de horario, urgentes, fijados, "leído", lecturas, vigencia/renovación | `/api/avisos` |
| `agenda` | Eventos, capacitaciones, reuniones, recordatorio, export .ics | `/api/agenda` |
| `notificaciones` | Bandeja in-app y contador | `/api/notificaciones` |
| `puesto` | Checklist diario/semanal por sector y puesto, avance, referente, protocolos | `/api/mi-puesto`, `/api/puesto` |
| `pedidos` | Pedidos e interconsultas entre áreas con estado, plazo e historial | `/api/pedidos` |
| `buzon` | Consultas, sugerencias, reclamos; anónimo real; plazo 72 h | `/api/buzon` |
| `biblioteca` | Protocolos, manual de inducción, reglamento, institucional, kit de bienvenida | `/api/biblioteca` |
| `inicio` | Pantalla Inicio en un request y resumen semanal | `/api/inicio`, `/api/resumen-semanal` |
| `jobs` | Recordatorios (1 min), vencimientos (7:00), resumen semanal (lunes 8:00) | — |

## Variables de entorno

| Variable | Default | Producción |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | `postgres` |
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | ver `application.yml` | las tuyas |
| `JWT_SECRET` | secreto de desarrollo | **obligatorio**: `openssl rand -base64 48` |
| `APP_SEED` | `true` | `false` |
| `CORS_ORIGINS` | localhost:5500/3000/5173 | origen del frontend si se sirve aparte |
| `PORT` | `8080` | — |

## Decisiones de diseño

- **Anonimato real en el buzón**: si `anonimo=true` no se persiste `autor_id` ni `sector_id`. El seguimiento es por `codigoSeguimiento` (10 caracteres, `SecureRandom`).
- **Vigencia obligatoria**: avisos y documentos tienen `vigente_hasta`; las consultas filtran por fecha, así que lo vencido "desaparece" sin borrarse y se puede renovar.
- **Alcance por sector**: referentes solo publican y gestionan tareas de su sector (validado en `AlcancePublicacionService` y `MiPuestoService`, no solo en el front).
- **Sin datos de pacientes**: el modelo no tiene ningún campo para ellos.
- **JWT stateless (12 h)**: el rol viaja en el token. Si cambiás el rol de alguien, lo ve en su próximo login.
- **Bloqueo de login**: 5 intentos fallidos → 10 minutos (en memoria; pasar a Redis si hay más de una instancia).
