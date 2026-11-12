"use client";

import { useState } from "react";

import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Pestanas } from "@/components/ui/Varios";
import { ETIQUETA_SECCION, type SeccionGestion } from "@/lib/permisos";
import type { Sector } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { SeccionBuzon } from "./SeccionBuzon";
import { SeccionPedidos } from "./SeccionPedidos";
import { SeccionTareas } from "./SeccionTareas";
import { SeccionUsuarios } from "./SeccionUsuarios";

interface Props {
  secciones: SeccionGestion[];
  inicial: SeccionGestion;
  sectores: Sector[];
}

export function PantallaGestion({ secciones, inicial, sectores }: Props) {
  const usuario = useUsuario();
  const [activa, setActiva] = useState(inicial);
  return (
    <>
      <Encabezado titulo="Gestión" subtitulo={`${usuario.rolEtiqueta} · ${usuario.sector.nombre}`} volver="/mas" />
      <Contenido>
        {secciones.length > 1 && (
          <Pestanas
            etiqueta="Secciones de gestión"
            opciones={secciones.map((s) => ({ valor: s, texto: ETIQUETA_SECCION[s] }))}
            activa={activa}
            alCambiar={setActiva}
            panel="panel-gestion"
          />
        )}
        <div id="panel-gestion" role="tabpanel">
          {activa === "buzon" && <SeccionBuzon />}
          {activa === "tareas" && <SeccionTareas sectores={sectores} />}
          {activa === "pedidos" && <SeccionPedidos />}
          {activa === "usuarios" && <SeccionUsuarios sectores={sectores} />}
        </div>
      </Contenido>
    </>
  );
}
