"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada } from "@/components/ui/Campo";
import { Icono } from "@/components/ui/Icono";
import { Mensaje } from "@/components/ui/Mensaje";
import { useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { esApiError, SIN_CONEXION } from "@/lib/api/errores";
import { saludo } from "@/lib/fechas";
import { COLOR_ROL, destinoInicial, menuPara, PANTALLAS } from "@/lib/permisos";
import { PASSWORD_DEMO } from "@/lib/sesion";
import type { UsuarioActual } from "@/lib/tipos";
import { BASE_COMPLETA, PERMISOS_DEMO, QUE_PUEDE, USUARIOS_DEMO } from "./demo";
import { cambiarPasswordSchema, loginSchema } from "./schema";
import { cerrarSesion, iniciarSesion } from "./sesion";

type Panel = "login" | "clave" | "vista";

interface Props {
  volver: string;
  vencida: boolean;
  cambiar: boolean;
  modoDemo: boolean;
}

function irA(ruta: string) {
  // Navegación completa: el layout protegido vuelve a leer la sesión desde la cookie nueva.
  window.location.assign(ruta);
}

export function PantallaLogin({ volver, vencida, cambiar, modoDemo }: Props) {
  const [panel, setPanel] = useState<Panel>(cambiar ? "clave" : "login");
  const [vistaPrevia, setVistaPrevia] = useState<UsuarioActual | null>(null);

  useEffect(() => {
    // Sesión vencida: borramos la cookie vieja para no rebotar entre el proxy y el login.
    if (vencida) void cerrarSesion().catch(() => {});
  }, [vencida]);

  return (
    <div className="flex min-h-dvh flex-col md:bg-[linear-gradient(90deg,var(--l-direccion)_0_8px,transparent_8px_16px,var(--l-referente)_16px_24px,transparent_24px_32px,var(--l-maestranza)_32px_40px,transparent_40px)] md:bg-size-[40px_100%] md:bg-no-repeat">
      <header className="mx-auto flex w-full max-w-[460px] items-center gap-3 px-6 pt-7">
        <Marca />
        <div>
          <p className="text-[21px] leading-tight font-bold tracking-tight">Centro Conectado</p>
          <p className="text-[15px] text-tinta-suave">Comunicación interna del Centro</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[460px] flex-1 px-6 pt-8 pb-6">
        {panel === "login" && (
          <PanelLogin
            vencida={vencida}
            modoDemo={modoDemo}
            alEntrar={(u) => {
              if (u.debeCambiarPassword) setPanel("clave");
              else irA(volver);
            }}
            alVistaPrevia={(u) => {
              setVistaPrevia(u);
              setPanel("vista");
            }}
          />
        )}
        {panel === "clave" && <PanelClave alGuardar={(u) => irA(destinoInicial(u) === "/inicio" ? volver : destinoInicial(u))} />}
        {panel === "vista" && vistaPrevia && (
          <PanelVista
            usuario={vistaPrevia}
            alOtroRol={() => {
              setVistaPrevia(null);
              setPanel("login");
            }}
          />
        )}
      </main>

      <footer className="mx-auto w-full max-w-[460px] px-6 pb-7 text-sm text-tinta-suave">
        Lo oficial va por acá. WhatsApp, solo para lo urgente. Sin datos de pacientes.
      </footer>
    </div>
  );
}

function Marca() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="11" fill="#12302A" />
      <path d="M9 34h10a6 6 0 0 0 6-6V10" fill="none" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
      <path d="M9 27h6a4 4 0 0 0 4-4V10" fill="none" stroke="#5FC3A8" strokeWidth="4" strokeLinecap="round" />
      <path d="M31 10v24" fill="none" stroke="#8FB3F0" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const CAMPOS_LOGIN = ["usuario", "password"] as const;

function PanelLogin({
  vencida,
  modoDemo,
  alEntrar,
  alVistaPrevia,
}: {
  vencida: boolean;
  modoDemo: boolean;
  alEntrar: (u: UsuarioActual) => void;
  alVistaPrevia: (u: UsuarioActual) => void;
}) {
  const { errores, general, ocupado, enviar, setGeneral } = useEnvio(CAMPOS_LOGIN);
  const [verClave, setVerClave] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  async function ingresar(datos: FormData) {
    const valores = {
      usuario: String(datos.get("usuario") ?? ""),
      password: String(datos.get("password") ?? ""),
      recordar: datos.get("recordar") === "on",
    };
    let sinServidor = false;
    const r = await enviar(loginSchema, valores, async (v) => {
      try {
        return await iniciarSesion(v);
      } catch (e) {
        if (esApiError(e) && e.status === SIN_CONEXION) sinServidor = true;
        throw e;
      }
    });
    if (r) {
      alEntrar(r.usuario);
      return;
    }
    // Sin servidor y con un usuario de demo: mostramos cómo se ve la app para ese rol, con datos locales.
    const demo = USUARIOS_DEMO.find((d) => d.usuario === valores.usuario.trim().toLowerCase());
    if (sinServidor && modoDemo && demo && valores.password === PASSWORD_DEMO) {
      setGeneral(null);
      alVistaPrevia({
        id: 0,
        usuario: demo.usuario,
        nombre: demo.nombre,
        apellido: demo.apellido,
        puesto: demo.puesto,
        rol: demo.rol,
        rolEtiqueta: demo.etiqueta,
        vista: demo.rol === "MAESTRANZA" ? "SIMPLE" : "COMPLETA",
        sector: { id: 0, codigo: "", nombre: demo.sector },
        permisos: PERMISOS_DEMO[demo.rol],
        debeCambiarPassword: false,
      });
    }
  }

  function entrarComo(usuario: string) {
    const f = form.current;
    if (!f) return;
    (f.elements.namedItem("usuario") as HTMLInputElement).value = usuario;
    (f.elements.namedItem("password") as HTMLInputElement).value = PASSWORD_DEMO;
    f.requestSubmit();
  }

  return (
    <section aria-labelledby="titulo-login">
      <h1 id="titulo-login" className="mb-1.5 text-[30px] leading-tight font-bold tracking-tight">
        Ingresá
      </h1>
      <p className="mb-7 text-tinta-suave">Con tu DNI y la contraseña que te dio tu referente.</p>

      {vencida && !general && <Mensaje tipo="info">Tu sesión venció. Ingresá de nuevo.</Mensaje>}
      <Mensaje tipo="error">{general}</Mensaje>

      <form
        ref={form}
        noValidate
        aria-label="Ingresar"
        onSubmit={(e) => {
          e.preventDefault();
          void ingresar(new FormData(e.currentTarget));
        }}
      >
        <Campo nombre="usuario" etiqueta="DNI o usuario" error={errores.usuario}>
          {(p) => (
            <input
              {...p}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={40}
              className={`${claseEntrada} h-14 text-[19px]`}
            />
          )}
        </Campo>
        <Campo nombre="password" etiqueta="Contraseña" error={errores.password}>
          {(p) => (
            <div className="flex rounded-[10px] border-2 border-borde bg-papel focus-within:border-tinta focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-senal has-aria-invalid:border-error">
              <input
                {...p}
                type={verClave ? "text" : "password"}
                autoComplete="current-password"
                maxLength={100}
                className="h-14 min-w-0 flex-1 bg-transparent px-3.5 text-[19px] outline-none focus-visible:outline-none"
              />
              <button
                type="button"
                aria-controls={p.id}
                aria-pressed={verClave}
                onClick={() => setVerClave((v) => !v)}
                className="cursor-pointer px-3.5 text-[15px] font-bold"
              >
                {verClave ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          )}
        </Campo>
        <label className="mt-1 mb-5 flex cursor-pointer items-start gap-2.5">
          <input type="checkbox" name="recordar" className="mt-0.5 size-[22px] shrink-0 accent-tinta" />
          <span>
            Mantener la sesión en este celular
            <small className="block text-sm text-tinta-suave">No lo marques en la tablet de la sala de descanso.</small>
          </span>
        </label>
        <Boton type="submit" ancho ocupado={ocupado} className="h-[58px] text-[19px]">
          {ocupado ? "Ingresando" : "Ingresar"}
        </Boton>
      </form>

      <p className="mt-4.5 text-tinta-suave">¿Olvidaste la contraseña? Pedile a tu referente de sector que te la blanquee.</p>

      {modoDemo && (
        <section aria-labelledby="titulo-pisos" className="mt-10">
          <h2 id="titulo-pisos" className="mb-1 text-[17px] font-bold">
            Probar con un rol
          </h2>
          <p className="mb-3.5 text-[15px] text-tinta-suave">Datos de demostración. Cada línea entra como una persona distinta.</p>
          <ul className="-mx-6">
            {USUARIOS_DEMO.map((d) => (
              <li key={d.usuario}>
                <button
                  type="button"
                  onClick={() => entrarComo(d.usuario)}
                  style={{ "--c": COLOR_ROL[d.rol] } as CSSProperties}
                  className={
                    "group relative grid min-h-16 w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-6 pt-2.5 pb-4.5 text-left " +
                    "after:absolute after:inset-x-0 after:bottom-1.5 after:h-1.5 after:bg-(--c) after:transition-all " +
                    "hover:after:bottom-1 hover:after:h-2.5 focus-visible:after:bottom-1 focus-visible:after:h-2.5 focus-visible:-outline-offset-3"
                  }
                >
                  <span>
                    <span className="block leading-tight font-bold">{d.etiqueta}</span>
                    <span className="block text-[15px] text-tinta-suave">
                      {d.nombre}, {d.puesto.toLowerCase()}
                    </span>
                  </span>
                  <span className="text-[15px] font-bold">Entrar</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

const CAMPOS_CLAVE = ["actual", "nueva"] as const;

function PanelClave({ alGuardar }: { alGuardar: (u: UsuarioActual) => void }) {
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS_CLAVE);
  return (
    <section aria-labelledby="titulo-clave">
      <h1 id="titulo-clave" className="mb-1.5 text-[30px] leading-tight font-bold tracking-tight">
        Elegí tu contraseña
      </h1>
      <p className="mb-7 text-tinta-suave">
        Es tu primer ingreso o te la blanquearon. La contraseña es solo tuya: no la compartas por WhatsApp.
      </p>
      <Mensaje tipo="error">{general}</Mensaje>
      <form
        noValidate
        aria-label="Cambiar contraseña"
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const u = await enviar(
            cambiarPasswordSchema,
            { actual: String(d.get("actual") ?? ""), nueva: String(d.get("nueva") ?? "") },
            (v) => api.auth.cambiarPassword(v.actual, v.nueva),
          );
          if (u) alGuardar(u);
        }}
      >
        <Campo nombre="actual" etiqueta="Contraseña que te dieron" error={errores.actual}>
          {(p) => <input {...p} type="password" autoComplete="current-password" className={claseEntrada} />}
        </Campo>
        <Campo nombre="nueva" etiqueta="Contraseña nueva" error={errores.nueva} ayuda="Mínimo 8 caracteres.">
          {(p) => <input {...p} type="password" autoComplete="new-password" maxLength={100} className={claseEntrada} />}
        </Campo>
        <Boton type="submit" ancho ocupado={ocupado}>
          {ocupado ? "Guardando" : "Guardar y entrar"}
        </Boton>
      </form>
    </section>
  );
}

/** Vista previa del rol cuando el backend no responde (modo demo). No navega a la app. */
function PanelVista({ usuario, alOtroRol }: { usuario: UsuarioActual; alOtroRol: () => void }) {
  const simple = usuario.vista === "SIMPLE";
  const puede = BASE_COMPLETA.concat(usuario.permisos.map((p) => QUE_PUEDE[p]));
  return (
    <section aria-labelledby="titulo-vista">
      <Mensaje tipo="info">
        Así entra {usuario.nombre}, con rol {usuario.rolEtiqueta.toLowerCase()}.
      </Mensaje>
      <h1 id="titulo-vista" className="mb-3.5 text-2xl font-bold">
        Así se ve tu app
      </h1>
      <article
        data-rol={usuario.rol}
        style={{ "--color-rol": COLOR_ROL[usuario.rol] } as CSSProperties}
        className="overflow-hidden rounded-[20px] border-2 border-pared-2 bg-papel"
      >
        <div className="bg-rol px-5 pt-5 pb-4.5 text-texto-rol">
          <p className="text-[15px] opacity-90">{saludo()}</p>
          <p className="text-[26px] leading-tight font-bold">{usuario.nombre}</p>
          <p className="mt-0.5 text-[15px] opacity-90">{usuario.puesto}</p>
        </div>
        <div className="px-5 pt-4.5 pb-2">
          {simple ? (
            <>
              <h2 className="mb-2.5 font-bold">Lo tuyo de hoy</h2>
              <div className="mb-4 grid grid-cols-2 gap-2.5">
                {(["miPuesto", "inicio", "pedidos", "buzon"] as const).map((k) => (
                  <div key={k} className="flex flex-col items-center gap-2 rounded-[14px] bg-pared px-3 py-4 text-center text-lg font-bold">
                    <Icono nombre={PANTALLAS[k].icono} className="size-10" />
                    {PANTALLAS[k].etiqueta}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-2.5 font-bold">Con este rol podés</h2>
              <ul className="mb-4">
                {puede.map((t) => (
                  <li key={t} className="border-b border-pared py-2 pl-6 relative before:absolute before:top-4 before:left-1 before:size-2.5 before:rounded-xs before:bg-rol">
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="grid grid-flow-col border-t-2 border-pared" aria-label="Barra inferior de este rol">
          {menuPara(usuario).map((k, i) => (
            <span
              key={k}
              className={`flex flex-col items-center gap-0.5 px-0.5 pt-2.5 pb-3 text-[13px] ${i === 0 ? "font-bold text-tinta shadow-[inset_0_3px_0_var(--color-rol)]" : "text-tinta-suave"} ${simple ? "text-[15px]" : ""}`}
            >
              <Icono nombre={PANTALLAS[k].icono} className={simple ? "size-[30px]" : "size-6"} />
              {PANTALLAS[k].etiqueta}
            </span>
          ))}
        </div>
      </article>
      <div className="mt-4.5 grid gap-2.5">
        <Boton variante="secundario" ancho onClick={alOtroRol}>
          Probar otro rol
        </Boton>
      </div>
      <p className="mt-3 text-sm text-tinta-suave">
        Modo demostración: el servidor no está corriendo, así que esto se arma con datos locales. Con el backend levantado,
        este paso te lleva directo a Inicio.
      </p>
    </section>
  );
}
