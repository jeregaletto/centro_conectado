import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_TOKEN } from "@/lib/sesion";

/**
 * Proxy de Next 16 (antes se llamaba `middleware.ts`; Next 16 lo renombró a `proxy.ts`, mismo comportamiento).
 * Protege las rutas de la app: sin cookie de sesión → /login?volver=<ruta>.
 * Solo mira que la cookie exista: la autorización real la hace el backend en cada llamada,
 * y si el token venció el layout protegido manda al login.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.get(COOKIE_TOKEN)?.value) return NextResponse.next();

  const url = request.nextUrl.clone();
  const volver = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = "";
  if (volver !== "/" && volver !== "/inicio") url.searchParams.set("volver", volver);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo menos el login, los Route Handlers (/api: el proxy contesta 401 sin cookie) y los estáticos.
  matcher: ["/((?!login|api/|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|ico|jpg|webp)$).*)"],
};
