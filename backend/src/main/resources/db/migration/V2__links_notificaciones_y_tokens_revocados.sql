-- 1) Las notificaciones apuntaban a las maquetas HTML ("pedidos.html?id=3"). Ahora el frontend es Next.js
--    y los links son rutas ("/pedidos/3"). Reescribimos las que ya existen.

-- Aviso por vencer (al autor): va a Publicar > Publicados, donde se renueva.
UPDATE notificaciones SET link = '/publicar?tipo=publicados'
 WHERE tipo = 'CONTENIDO_POR_VENCER' AND link LIKE 'inicio.html?aviso=%';

UPDATE notificaciones SET link = REPLACE(link, 'inicio.html?aviso=', '/inicio?aviso=')
 WHERE link LIKE 'inicio.html?aviso=%';
UPDATE notificaciones SET link = '/inicio' WHERE link LIKE 'inicio.html%';
UPDATE notificaciones SET link = REPLACE(link, 'pedidos.html?id=', '/pedidos/') WHERE link LIKE 'pedidos.html?id=%';
UPDATE notificaciones SET link = REPLACE(link, 'agenda.html?evento=', '/agenda?evento=') WHERE link LIKE 'agenda.html?evento=%';
UPDATE notificaciones SET link = REPLACE(link, 'biblioteca.html?id=', '/biblioteca?id=') WHERE link LIKE 'biblioteca.html?id=%';
UPDATE notificaciones SET link = REPLACE(link, 'buzon.html?codigo=', '/buzon?codigo=') WHERE link LIKE 'buzon.html?codigo=%';
UPDATE notificaciones SET link = '/gestion?seccion=buzon' WHERE link LIKE 'buzon.html?gestion=%';
-- Cualquier otro link viejo ("x.html") pasa a la ruta equivalente sin parámetros.
UPDATE notificaciones SET link = '/' || SUBSTRING(link, 1, POSITION('.html' IN link) - 1)
 WHERE link LIKE '%.html%' AND link NOT LIKE '/%';

-- 2) Logout real: ids de JWT (jti) cerrados antes de vencer. Se borran solos al pasar expira_en.
CREATE TABLE tokens_revocados (
    jti       VARCHAR(64) PRIMARY KEY,
    expira_en TIMESTAMP   NOT NULL
);
CREATE INDEX idx_tokens_revocados_expira ON tokens_revocados (expira_en);
