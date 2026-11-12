import { rutaSegura } from "@/lib/rutas";

/**
 * El backend arma los links de las notificaciones con las rutas de las maquetas HTML
 * ("pedidos.html?id=3", "buzon.html?gestion=12"). Acá los traducimos a las rutas de Next.
 * Ver PENDIENTES.md: conviene que el backend pase a devolver rutas nuevas.
 */
export function rutaDeLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const limpio = link.trim();

  // Si el backend ya devuelve rutas nuevas ("/pedidos/3"), las validamos y listo.
  if (limpio.startsWith("/")) {
    const r = rutaSegura(limpio, "");
    return r || null;
  }

  const m = /^([a-z0-9-]+)\.html(?:\?(.*))?$/i.exec(limpio);
  if (!m) return null;
  const pagina = m[1].toLowerCase();
  const params = new URLSearchParams(m[2] ?? "");
  const entero = (clave: string) => {
    const v = params.get(clave);
    return v && /^\d+$/.test(v) ? v : null;
  };

  switch (pagina) {
    case "inicio": {
      const aviso = entero("aviso");
      return aviso ? `/inicio?aviso=${aviso}` : "/inicio";
    }
    case "pedidos":
    case "pedido": {
      const id = entero("id");
      return id ? `/pedidos/${id}` : "/pedidos";
    }
    case "buzon": {
      if (params.has("gestion")) return "/gestion?seccion=buzon";
      const codigo = params.get("codigo");
      return codigo && /^[A-Za-z0-9]{4,20}$/.test(codigo) ? `/buzon?codigo=${codigo}` : "/buzon";
    }
    case "agenda": {
      const evento = entero("evento");
      return evento ? `/agenda?evento=${evento}` : "/agenda";
    }
    case "biblioteca": {
      const id = entero("id");
      return id ? `/biblioteca?id=${id}` : "/biblioteca";
    }
    case "mi-puesto":
    case "quien-es-quien":
    case "publicar":
    case "gestion":
    case "mas":
    case "notificaciones":
      return `/${pagina}`;
    default:
      return null;
  }
}

/** ¿Esta notificación habla de este aviso? (para bajarla al marcar el aviso como leído) */
export function esDelAviso(link: string | null | undefined, avisoId: number): boolean {
  return rutaDeLink(link) === `/inicio?aviso=${avisoId}`;
}
