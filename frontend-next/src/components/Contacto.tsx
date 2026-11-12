import { EnlaceBoton } from "@/components/ui/Boton";
import { Icono } from "@/components/ui/Icono";
import { Acciones, Meta, TituloTarjeta } from "@/components/ui/Tarjeta";
import type { Contacto } from "@/lib/tipos";

/** Solo dígitos y "+", para tel: y wa.me. */
export function telefonoLimpio(t: string): string {
  return t.replace(/[^\d+]/g, "");
}

/** Datos de una persona con botones para llamar, WhatsApp y mail. */
export function DatosContacto({ contacto: c, whatsapp = true }: { contacto: Contacto; whatsapp?: boolean }) {
  const tel = c.telefono ? telefonoLimpio(c.telefono) : null;
  return (
    <>
      <TituloTarjeta>{c.nombre}</TituloTarjeta>
      <Meta>
        {[c.puesto, c.sector, c.interno ? `Interno ${c.interno}` : null].filter(Boolean).join(" · ")}
      </Meta>
      {c.telefono && <Meta>{c.telefono}</Meta>}
      {(tel || c.email) && (
        <Acciones>
          {tel && (
            <EnlaceBoton href={`tel:${tel}`} tamano="chico" externo={false} className="no-underline">
              <Icono nombre="telefono" className="size-5" /> Llamar
            </EnlaceBoton>
          )}
          {tel && whatsapp && (
            <EnlaceBoton href={`https://wa.me/${tel.replace("+", "")}`} tamano="chico" variante="secundario" externo>
              WhatsApp
            </EnlaceBoton>
          )}
          {c.email && (
            <EnlaceBoton href={`mailto:${c.email}`} tamano="chico" variante="secundario" externo={false}>
              <Icono nombre="correo" className="size-5" /> Mail
            </EnlaceBoton>
          )}
        </Acciones>
      )}
    </>
  );
}
