import { rutaSegura } from "@/lib/rutas";

/**
 * Ruta a la que lleva una notificación. El backend manda rutas del frontend ("/pedidos/3",
 * "/gestion?seccion=buzon"); igual se validan como rutas propias antes de navegar.
 */
export function rutaDeLink(link: string | null | undefined): string | null {
  if (!link) return null;
  return rutaSegura(link.trim(), "") || null;
}
