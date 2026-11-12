import type { Http } from "../client";
import type { ActualizarUsuarioRequest, CrearUsuarioRequest, Sector, UsuarioAdmin } from "@/lib/tipos";

export const admin = (http: Http) => ({
  usuarios: () => http.pedir<UsuarioAdmin[]>("GET", "/admin/usuarios"),
  crearUsuario: (datos: CrearUsuarioRequest) => http.pedir<UsuarioAdmin>("POST", "/admin/usuarios", datos),
  actualizarUsuario: (id: number, datos: ActualizarUsuarioRequest) =>
    http.pedir<UsuarioAdmin>("PUT", `/admin/usuarios/${id}`, datos),
  resetPassword: (id: number, passwordTemporal: string) =>
    http.pedir<void>("POST", `/admin/usuarios/${id}/reset-password`, { passwordTemporal }),
  asignarReferente: (sectorId: number, usuarioId: number) =>
    http.pedir<Sector>("PUT", `/admin/sectores/${sectorId}/referente`, { usuarioId }),
});
