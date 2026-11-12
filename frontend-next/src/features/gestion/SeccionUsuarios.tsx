"use client";

import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada } from "@/components/ui/Campo";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Acciones, Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { Plegable } from "@/components/ui/Varios";
import { texto, textoONull } from "@/features/comun/formularios";
import { useAccion, useConsulta, useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { ROL } from "@/lib/etiquetas";
import type { Rol, Sector, UsuarioAdmin } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { crearUsuarioSchema, resetPasswordSchema } from "./schema";

const CAMPOS = ["usuario", "nombre", "apellido", "email", "telefono", "interno", "puesto", "rol", "sectorId", "passwordInicial"] as const;

/** Alta, contraseña temporal y desactivar. Comunicación no puede crear usuarios de Dirección (lo valida el backend). */
export function SeccionUsuarios({ sectores }: { sectores: Sector[] }) {
  const yo = useUsuario();
  const avisar = useAvisos();
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const { datos, error, setDatos } = useConsulta("usuarios", () => api.admin.usuarios());
  const envio = useEnvio(CAMPOS);
  const roles = (Object.keys(ROL) as Rol[]).filter((r) => yo.rol === "DIRECCION" || r !== "DIRECCION");

  const filtro = q.trim().toLowerCase();
  const lista = (datos ?? []).filter(
    (u) => !filtro || `${u.nombre} ${u.apellido} ${u.usuario} ${u.sector.nombre}`.toLowerCase().includes(filtro),
  );
  const reemplazar = (u: UsuarioAdmin) => datos && setDatos(datos.map((x) => (x.id === u.id ? u : x)));

  return (
    <>
      <Plegable titulo="Nuevo usuario" abierto={abierto} alCambiar={setAbierto}>
        <form
          noValidate
          aria-label="Nuevo usuario"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            const nuevo = await envio.enviar(
              crearUsuarioSchema,
              {
                usuario: texto(d, "usuario"),
                nombre: texto(d, "nombre"),
                apellido: texto(d, "apellido"),
                email: textoONull(d, "email"),
                telefono: textoONull(d, "telefono"),
                interno: textoONull(d, "interno"),
                puesto: texto(d, "puesto"),
                rol: texto(d, "rol"),
                sectorId: Number(texto(d, "sectorId")) || undefined,
                passwordInicial: String(d.get("passwordInicial") ?? ""),
              },
              (v) => api.admin.crearUsuario(v),
            );
            if (nuevo) {
              form.reset();
              setAbierto(false);
              setDatos([nuevo, ...(datos ?? [])]);
              avisar(`Usuario ${nuevo.usuario} creado`);
            }
          }}
        >
          <Mensaje tipo="error">{envio.general}</Mensaje>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Campo nombre="nombre" etiqueta="Nombre" error={envio.errores.nombre}>
              {(p) => <input {...p} maxLength={80} className={claseEntrada} />}
            </Campo>
            <Campo nombre="apellido" etiqueta="Apellido" error={envio.errores.apellido}>
              {(p) => <input {...p} maxLength={80} className={claseEntrada} />}
            </Campo>
            <Campo nombre="usuario" etiqueta="Usuario o DNI" error={envio.errores.usuario}>
              {(p) => <input {...p} maxLength={40} autoComplete="off" className={claseEntrada} />}
            </Campo>
            <Campo nombre="puesto" etiqueta="Puesto" error={envio.errores.puesto}>
              {(p) => <input {...p} maxLength={80} className={claseEntrada} />}
            </Campo>
            <Campo nombre="rol" etiqueta="Rol" error={envio.errores.rol}>
              {(p) => (
                <select {...p} defaultValue="PROFESIONAL" className={claseEntrada}>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {ROL[r]}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo nombre="sectorId" etiqueta="Sector" error={envio.errores.sectorId}>
              {(p) => (
                <select {...p} className={claseEntrada}>
                  {sectores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo nombre="telefono" etiqueta="Teléfono" error={envio.errores.telefono}>
              {(p) => <input {...p} type="tel" maxLength={40} className={claseEntrada} />}
            </Campo>
            <Campo nombre="interno" etiqueta="Interno" error={envio.errores.interno}>
              {(p) => <input {...p} maxLength={20} className={claseEntrada} />}
            </Campo>
          </div>
          <Campo nombre="email" etiqueta="Email" error={envio.errores.email}>
            {(p) => <input {...p} type="email" maxLength={150} className={claseEntrada} />}
          </Campo>
          <Campo
            nombre="passwordInicial"
            etiqueta="Contraseña inicial"
            error={envio.errores.passwordInicial}
            ayuda="Mínimo 8 caracteres. La persona la cambia en su primer ingreso."
          >
            {(p) => <input {...p} maxLength={100} autoComplete="new-password" className={claseEntrada} />}
          </Campo>
          <Boton type="submit" ancho ocupado={envio.ocupado}>
            Crear usuario
          </Boton>
        </form>
      </Plegable>

      <Campo nombre="u-buscar" etiqueta="Buscar por nombre, usuario o sector" etiquetaOculta>
        {(p) => (
          <input
            {...p}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, usuario o sector"
            className={claseEntrada}
          />
        )}
      </Campo>
      <Mensaje tipo="error">{error}</Mensaje>
      {!datos ? (
        !error && <Cargando />
      ) : lista.length === 0 ? (
        <Vacio>Sin resultados.</Vacio>
      ) : (
        <ul>
          {lista.map((u) => (
            <FilaUsuario key={u.id} u={u} alCambiar={reemplazar} />
          ))}
        </ul>
      )}
    </>
  );
}

const CAMPOS_RESET = ["passwordTemporal"] as const;

function FilaUsuario({ u, alCambiar }: { u: UsuarioAdmin; alCambiar: (u: UsuarioAdmin) => void }) {
  const avisar = useAvisos();
  const [reset, setReset] = useState(false);
  const { ocupadoEn, correr } = useAccion();
  const envio = useEnvio(CAMPOS_RESET);

  async function alternarActivo() {
    const r = await correr("activo", () =>
      api.admin.actualizarUsuario(u.id, {
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        telefono: u.telefono,
        interno: u.interno,
        puesto: u.puesto,
        rol: u.rol,
        sectorId: u.sector.id,
        activo: !u.activo,
      }),
    );
    if (r.ok) alCambiar(r.valor);
    else avisar(r.error, "error");
  }

  return (
    <Tarjeta como="li" acento={u.activo ? "neutro" : "apagado"}>
      <Chip>{ROL[u.rol]}</Chip>
      {!u.activo && <Chip tono="apagado">Inactivo</Chip>}
      {u.debeCambiarPassword && <Chip tono="alerta">Debe cambiar la contraseña</Chip>}
      <TituloTarjeta>
        {u.nombre} {u.apellido}
      </TituloTarjeta>
      <Meta>
        {u.usuario} · {u.puesto} · {u.sector.nombre}
      </Meta>
      <Acciones>
        <Boton variante="secundario" tamano="chico" onClick={() => setReset((v) => !v)} aria-expanded={reset}>
          Nueva contraseña
        </Boton>
        <Boton variante={u.activo ? "peligro" : "secundario"} tamano="chico" ocupado={ocupadoEn === "activo"} onClick={alternarActivo}>
          {u.activo ? "Desactivar" : "Reactivar"}
        </Boton>
      </Acciones>
      {reset && (
        <form
          noValidate
          aria-label={`Nueva contraseña para ${u.nombre}`}
          className="mt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const clave = String(new FormData(e.currentTarget).get("passwordTemporal") ?? "");
            const r = await envio.enviar(resetPasswordSchema, { passwordTemporal: clave }, async (v) => {
              await api.admin.resetPassword(u.id, v.passwordTemporal);
              return true;
            });
            if (r) {
              setReset(false);
              alCambiar({ ...u, debeCambiarPassword: true });
              avisar("Contraseña cambiada. Pasásela a la persona: la cambia al entrar.");
            }
          }}
        >
          <Mensaje tipo="error">{envio.general}</Mensaje>
          <Campo nombre={`passwordTemporal-${u.id}`} etiqueta="Contraseña temporal" error={envio.errores.passwordTemporal} ayuda="Mínimo 8 caracteres.">
            {(p) => <input {...p} name="passwordTemporal" maxLength={100} autoComplete="new-password" className={claseEntrada} />}
          </Campo>
          <Boton type="submit" tamano="chico" ocupado={envio.ocupado}>
            Guardar
          </Boton>
        </form>
      )}
    </Tarjeta>
  );
}
