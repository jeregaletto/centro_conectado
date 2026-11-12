/**
 * Centro Conectado · sesión, protección de pantallas y navegación por rol.
 * Requiere js/api.js. Uso en cada maqueta (menos login.html):
 *
 *   <script src="js/api.js"></script>
 *   <script src="js/sesion.js"></script>
 *   <script>
 *     const usuario = Sesion.proteger();          // redirige a login si no hay sesión
 *     Sesion.pintarNavegacion('#barra-inferior', 'inicio');
 *   </script>
 */
(function (global) {
  'use strict';

  /** Todas las pantallas de la app. La barra inferior muestra a lo sumo 5. */
  const PANTALLAS = {
    inicio:     { etiqueta: 'Inicio',      href: 'inicio.html',     icono: 'casa' },
    agenda:     { etiqueta: 'Agenda',      href: 'agenda.html',     icono: 'calendario' },
    miPuesto:   { etiqueta: 'Mi puesto',   href: 'mi-puesto.html',  icono: 'check' },
    pedidos:    { etiqueta: 'Pedidos',     href: 'pedidos.html',    icono: 'flechas' },
    buzon:      { etiqueta: 'Buzón',       href: 'buzon.html',      icono: 'buzon' },
    quien:      { etiqueta: 'Quién es quién', href: 'quien-es-quien.html', icono: 'personas' },
    biblioteca: { etiqueta: 'Biblioteca',  href: 'biblioteca.html', icono: 'libro' },
    publicar:   { etiqueta: 'Publicar',    href: 'publicar.html',   icono: 'mas' },
    gestion:    { etiqueta: 'Gestión',     href: 'gestion.html',    icono: 'panel' },
    mas:        { etiqueta: 'Más',         href: 'mas.html',        icono: 'menu' },
  };

  /** Color de cada rol (las "líneas de piso" del login). */
  const COLOR_ROL = {
    DIRECCION: '#1F4E8C', COMUNICACION: '#6B4BA8', REFERENTE: '#0E7C66',
    PROFESIONAL: '#B83A4B', ADMINISTRATIVO: '#C46A12', MAESTRANZA: '#E0B400',
  };

  const tiene = (u, permiso) => !!u && Array.isArray(u.permisos) && u.permisos.includes(permiso);

  /**
   * Qué ve cada rol. Una sola fuente de verdad para todas las maquetas.
   * La seguridad real la aplica el backend: esto solo decide qué botones mostrar.
   */
  function menuPara(u) {
    if (!u) return [];
    if (u.vista === 'SIMPLE') {
      // Maestranza: 4 botones grandes, sin submenús.
      return ['inicio', 'miPuesto', 'pedidos', 'buzon'];
    }
    const barra = ['inicio', 'agenda', 'pedidos', 'buzon', 'mas'];
    return barra;
  }

  /** Lo que va dentro de "Más" según permisos. */
  function menuMas(u) {
    const items = ['miPuesto', 'quien', 'biblioteca'];
    if (tiene(u, 'PUBLICAR_GENERAL') || tiene(u, 'PUBLICAR_SECTOR')) items.unshift('publicar');
    if (tiene(u, 'GESTIONAR_BUZON') || tiene(u, 'GESTIONAR_USUARIOS') || tiene(u, 'GESTIONAR_TAREAS_SECTOR')) items.unshift('gestion');
    return items;
  }

  /**
   * Pantalla a la que va cada rol después del login. Todos arrancan en Inicio
   * (ahí está el aviso fijado); en vista SIMPLE, Inicio muestra además el avance de Mi puesto.
   */
  function destinoInicial(u) {
    if (u && u.debeCambiarPassword) return 'login.html?cambiar=1';
    return PANTALLAS.inicio.href;
  }

  /** Llamalo al principio de cada pantalla protegida. */
  function proteger(opciones = {}) {
    const u = CentroAPI.sesion.usuario();
    if (!CentroAPI.sesion.token() || !u) {
      const volver = encodeURIComponent(global.location.pathname.split('/').pop() + global.location.search);
      global.location.replace(`login.html?volver=${volver}`);
      throw new Error('Sin sesión'); // corta la ejecución del resto del script
    }
    if (opciones.permiso && !tiene(u, opciones.permiso)) {
      global.location.replace(destinoInicial(u));
      throw new Error('Sin permiso');
    }
    document.documentElement.style.setProperty('--color-rol', COLOR_ROL[u.rol] || '#14302B');
    document.documentElement.dataset.vista = u.vista; // CSS: [data-vista="SIMPLE"] { font-size: 1.15rem }
    return u;
  }

  function cerrarSesion() {
    CentroAPI.sesion.limpiar();
    global.location.href = 'login.html';
  }

  /**
   * Reemplaza el contenido de tu barra inferior por los botones del rol.
   * @param {string} selector  contenedor de la barra (ej: '#barra-inferior' o 'nav.tabbar')
   * @param {string} activa    clave de la pantalla actual ('inicio', 'pedidos', ...)
   */
  function pintarNavegacion(selector, activa) {
    const nav = document.querySelector(selector);
    const u = CentroAPI.sesion.usuario();
    if (!nav || !u) return;
    nav.innerHTML = '';
    menuPara(u).forEach((clave) => {
      const p = PANTALLAS[clave];
      const a = document.createElement('a');
      a.href = p.href;
      a.className = 'tab' + (clave === activa ? ' tab--activa' : '');
      a.dataset.icono = p.icono;
      if (clave === activa) a.setAttribute('aria-current', 'page');
      a.innerHTML = `<span class="tab__icono" aria-hidden="true"></span><span class="tab__texto">${p.etiqueta}</span>`;
      nav.appendChild(a);
    });
  }

  /** Badge de la campanita: consulta el contador cada 60 s. */
  function iniciarContadorNotificaciones(selectorBadge) {
    const badge = document.querySelector(selectorBadge);
    if (!badge) return;
    const actualizar = async () => {
      try {
        const { noLeidas } = await CentroAPI.notificaciones.contador();
        badge.textContent = noLeidas > 99 ? '99+' : String(noLeidas);
        badge.hidden = noLeidas === 0;
      } catch (_) { /* sin conexión: no rompemos la pantalla */ }
    };
    actualizar();
    return setInterval(actualizar, 60000);
  }

  /** Escapa texto que viene del servidor antes de meterlo en innerHTML. */
  function esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // "2026-11-12" (LocalDate) se interpretaría como UTC y mostraría el día anterior: lo pasamos a hora local.
  const aFecha = (iso) => new Date(String(iso).length === 10 ? iso + 'T00:00:00' : iso);
  const fmt = {
    fecha: (iso) => aFecha(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    hora: (iso) => aFecha(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    fechaLarga: (iso) => aFecha(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    fechaHora: (iso) => `${fmt.fecha(iso)}, ${fmt.hora(iso)}`,
    /** Date → "2026-11-12" en hora local (para la API y los <input type="date">). */
    isoDia: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  };

  /** Botón en espera: deshabilitado y con aria-busy, para evitar doble envío. */
  function ocupado(btn, si) {
    if (!btn) return;
    btn.disabled = si;
    if (si) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy');
  }

  /**
   * Muestra un error de la API: el mensaje general en `destino` y, si vienen `campos`,
   * marca cada input del formulario (por atributo name) con su mensaje.
   */
  function mostrarError(destino, err, form) {
    if (form) {
      form.querySelectorAll('.campo__error').forEach((n) => n.remove());
      form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    }
    let marcados = 0;
    if (form && err && err.campos) {
      Object.entries(err.campos).forEach(([campo, msg]) => {
        const input = form.querySelector(`[name="${campo}"]`);
        if (!input) return;
        input.setAttribute('aria-invalid', 'true');
        input.insertAdjacentHTML('afterend', `<span class="campo__error">${esc(msg)}</span>`);
        marcados++;
      });
    }
    if (destino) {
      const texto = err ? (err.campos && !marcados ? Object.values(err.campos).join('. ') : err.message) : '';
      destino.textContent = texto || '';
      destino.hidden = !texto;
    }
  }

  /** Mensaje breve en pantalla (aria-live), reemplaza a alert(). */
  function aviso(texto, tipo = 'ok') {
    let caja = document.getElementById('toast');
    if (!caja) {
      caja = Object.assign(document.createElement('div'), { id: 'toast', className: 'toast' });
      caja.setAttribute('role', 'status');
      caja.setAttribute('aria-live', 'polite');
      document.body.appendChild(caja);
    }
    caja.textContent = texto;
    caja.dataset.tipo = tipo;
    caja.classList.add('toast--visible');
    clearTimeout(caja._t);
    caja._t = setTimeout(() => caja.classList.remove('toast--visible'), 3500);
  }

  global.Sesion = {
    PANTALLAS, COLOR_ROL, tiene, menuPara, menuMas, destinoInicial, proteger, cerrarSesion,
    pintarNavegacion, iniciarContadorNotificaciones, esc, fmt, ocupado, mostrarError, aviso,
  };
})(window);
