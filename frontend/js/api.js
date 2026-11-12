/**
 * Centro Conectado · cliente HTTP único para todas las maquetas.
 * Incluilo ANTES de sesion.js:  <script src="js/api.js"></script>
 *
 * - Si las maquetas las sirve Spring Boot (http://localhost:8080/login.html) la API es el mismo origen.
 * - Si las abrís con Live Server (puerto 5500) apunta a http://localhost:8080.
 */
(function (global) {
  'use strict';

  const API_BASE = (function () {
    if (global.CENTRO_API_BASE) return global.CENTRO_API_BASE; // override manual
    const { protocol, hostname, port } = global.location;
    if (protocol === 'file:') return 'http://localhost:8080';
    if (port === '8080') return '';                           // servido por el backend
    return `${protocol}//${hostname}:8080`;                    // Live Server, Vite, etc.
  })();

  const CLAVE_TOKEN = 'cc.token';
  const CLAVE_USUARIO = 'cc.usuario';
  const CLAVE_EXPIRA = 'cc.expira';

  /** Error con el formato del GlobalExceptionHandler del backend. */
  class ApiError extends Error {
    constructor(status, mensaje, campos) {
      super(mensaje);
      this.name = 'ApiError';
      this.status = status;
      this.campos = campos || null;
    }
  }

  // ---------- almacenamiento de sesión ----------
  // "Recordarme" → localStorage (celular personal). Si no → sessionStorage (tablet compartida).
  function store() {
    return localStorage.getItem(CLAVE_TOKEN) ? localStorage : sessionStorage;
  }

  function guardarSesion(respuestaLogin, recordar) {
    limpiarSesion();
    const s = recordar ? localStorage : sessionStorage;
    s.setItem(CLAVE_TOKEN, respuestaLogin.token);
    s.setItem(CLAVE_EXPIRA, respuestaLogin.expiraEn);
    s.setItem(CLAVE_USUARIO, JSON.stringify(respuestaLogin.usuario));
  }

  function limpiarSesion() {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(CLAVE_TOKEN);
      s.removeItem(CLAVE_USUARIO);
      s.removeItem(CLAVE_EXPIRA);
    });
  }

  function token() {
    const s = store();
    const t = s.getItem(CLAVE_TOKEN);
    const expira = s.getItem(CLAVE_EXPIRA);
    if (!t) return null;
    if (expira && new Date(expira) <= new Date()) {
      limpiarSesion();
      return null;
    }
    return t;
  }

  function usuarioGuardado() {
    const raw = store().getItem(CLAVE_USUARIO);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function actualizarUsuarioGuardado(usuario) {
    store().setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  }

  // ---------- fetch con token y manejo de errores centralizado ----------
  async function request(metodo, ruta, body, opciones = {}) {
    const headers = { Accept: 'application/json' };
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let res;
    try {
      res = await fetch(API_BASE + ruta, {
        method: metodo,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: opciones.signal,
      });
    } catch (e) {
      throw new ApiError(0, 'No hay conexión con el servidor. Revisá el wifi o avisá a tu referente.');
    }

    if (res.status === 401 && !opciones.esLogin) {
      limpiarSesion();
      const volver = encodeURIComponent(global.location.pathname + global.location.search);
      global.location.href = `login.html?vencida=1&volver=${volver}`;
      throw new ApiError(401, 'Tu sesión venció');
    }
    if (res.status === 204) return null;

    const tipo = res.headers.get('Content-Type') || '';
    const datos = tipo.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const mensaje = (datos && datos.mensaje) || `Error ${res.status}`;
      throw new ApiError(res.status, mensaje, datos && datos.campos);
    }
    return datos;
  }

  const http = {
    get: (ruta, op) => request('GET', ruta, undefined, op),
    post: (ruta, body, op) => request('POST', ruta, body, op),
    put: (ruta, body, op) => request('PUT', ruta, body, op),
    patch: (ruta, body, op) => request('PATCH', ruta, body, op),
    del: (ruta, op) => request('DELETE', ruta, undefined, op),
  };

  const qs = (params) => {
    const p = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
    return p.length ? '?' + new URLSearchParams(p).toString() : '';
  };

  // ---------- endpoints, agrupados por pantalla ----------
  const CentroAPI = {
    base: API_BASE,
    ApiError,
    http,
    sesion: { guardar: guardarSesion, limpiar: limpiarSesion, token, usuario: usuarioGuardado, actualizarUsuario: actualizarUsuarioGuardado },

    auth: {
      login: (usuario, password) => request('POST', '/api/auth/login', { usuario, password }, { esLogin: true }),
      me: () => http.get('/api/auth/me'),
      cambiarPassword: (actual, nueva) => http.post('/api/auth/cambiar-password', { actual, nueva }),
    },
    inicio: {
      obtener: () => http.get('/api/inicio'),
      resumenSemanal: () => http.get('/api/resumen-semanal'),
    },
    avisos: {
      listar: (f) => http.get('/api/avisos' + qs(f)),
      obtener: (id) => http.get(`/api/avisos/${id}`),
      marcarLeido: (id) => http.post(`/api/avisos/${id}/leido`),
      crear: (datos) => http.post('/api/avisos', datos),
      actualizar: (id, datos) => http.put(`/api/avisos/${id}`, datos),
      renovar: (id, vigenteHasta) => http.post(`/api/avisos/${id}/renovar`, { vigenteHasta: vigenteHasta || null }),
      eliminar: (id) => http.del(`/api/avisos/${id}`),
      lecturas: (id) => http.get(`/api/avisos/${id}/lecturas`),
      porVencer: () => http.get('/api/avisos/por-vencer'),
    },
    agenda: {
      listar: (desde, hasta) => http.get('/api/agenda' + qs({ desde, hasta })),
      hoy: () => http.get('/api/agenda/hoy'),
      obtener: (id) => http.get(`/api/agenda/${id}`),
      crear: (datos) => http.post('/api/agenda', datos),
      eliminar: (id) => http.del(`/api/agenda/${id}`),
      /** Descarga el .ics con token (un <a href> no manda el header Authorization). */
      descargarIcs: async (id) => {
        const res = await fetch(`${API_BASE}/api/agenda/${id}/ics`, { headers: { Authorization: `Bearer ${token()}` } });
        if (!res.ok) throw new ApiError(res.status, 'No se pudo descargar el evento');
        const url = URL.createObjectURL(await res.blob());
        const a = Object.assign(document.createElement('a'), { href: url, download: `evento-${id}.ics` });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    },
    notificaciones: {
      listar: (soloNoLeidas = false) => http.get('/api/notificaciones' + qs({ soloNoLeidas })),
      contador: () => http.get('/api/notificaciones/contador'),
      marcarLeida: (id) => http.post(`/api/notificaciones/${id}/leida`),
      leerTodas: () => http.post('/api/notificaciones/leer-todas'),
    },
    miPuesto: {
      obtener: () => http.get('/api/mi-puesto'),
      completar: (tareaId) => http.post(`/api/mi-puesto/tareas/${tareaId}/completar`),
      desmarcar: (tareaId) => http.del(`/api/mi-puesto/tareas/${tareaId}/completar`),
      tareasSector: (sectorId) => http.get('/api/puesto/tareas' + qs({ sectorId })),
      avanceSector: (sectorId) => http.get('/api/puesto/avance' + qs({ sectorId })),
      crearTarea: (datos) => http.post('/api/puesto/tareas', datos),
      actualizarTarea: (id, datos) => http.put(`/api/puesto/tareas/${id}`, datos),
      eliminarTarea: (id) => http.del(`/api/puesto/tareas/${id}`),
    },
    pedidos: {
      recibidos: (estado) => http.get('/api/pedidos/recibidos' + qs({ estado })),
      enviados: (estado) => http.get('/api/pedidos/enviados' + qs({ estado })),
      todos: (estado) => http.get('/api/pedidos/todos' + qs({ estado })),
      detalle: (id) => http.get(`/api/pedidos/${id}`),
      crear: (datos) => http.post('/api/pedidos', datos),
      cambiarEstado: (id, estado, comentario) => http.patch(`/api/pedidos/${id}/estado`, { estado, comentario }),
      comentar: (id, comentario) => http.post(`/api/pedidos/${id}/comentarios`, { comentario }),
    },
    buzon: {
      enviar: (datos) => http.post('/api/buzon', datos),
      mios: () => http.get('/api/buzon/mios'),
      seguimiento: (codigo) => http.get(`/api/buzon/seguimiento/${encodeURIComponent(codigo)}`),
      gestion: (estado) => http.get('/api/buzon/gestion' + qs({ estado })),
      responder: (id, respuesta) => http.post(`/api/buzon/${id}/responder`, { respuesta }),
      cambiarEstado: (id, estado) => http.patch(`/api/buzon/${id}/estado`, { estado }),
    },
    directorio: {
      buscar: (q, sectorId) => http.get('/api/directorio' + qs({ q, sectorId })),
      sectores: () => http.get('/api/sectores'),
      aQuienAcudir: () => http.get('/api/a-quien-acudir'),
    },
    biblioteca: {
      listar: (f) => http.get('/api/biblioteca' + qs(f)),
      porVencer: () => http.get('/api/biblioteca/por-vencer'),
      crear: (datos) => http.post('/api/biblioteca', datos),
      actualizar: (id, datos) => http.put(`/api/biblioteca/${id}`, datos),
      renovar: (id, vigenteHasta) => http.post(`/api/biblioteca/${id}/renovar`, { vigenteHasta: vigenteHasta || null }),
      eliminar: (id) => http.del(`/api/biblioteca/${id}`),
    },
    admin: {
      usuarios: () => http.get('/api/admin/usuarios'),
      crearUsuario: (datos) => http.post('/api/admin/usuarios', datos),
      actualizarUsuario: (id, datos) => http.put(`/api/admin/usuarios/${id}`, datos),
      resetPassword: (id, passwordTemporal) => http.post(`/api/admin/usuarios/${id}/reset-password`, { passwordTemporal }),
      asignarReferente: (sectorId, usuarioId) => http.put(`/api/admin/sectores/${sectorId}/referente`, { usuarioId }),
    },
  };

  global.CentroAPI = CentroAPI;
})(window);
