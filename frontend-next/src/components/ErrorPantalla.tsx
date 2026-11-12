import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Mensaje } from "@/components/ui/Mensaje";

/** Cuando el Server Component no pudo traer los datos: encabezado + mensaje amigable. */
export function ErrorPantalla({ titulo, error, volver }: { titulo: string; error: string; volver?: string }) {
  return (
    <>
      <Encabezado titulo={titulo} volver={volver} />
      <Contenido>
        <Mensaje tipo="error">{error}</Mensaje>
      </Contenido>
    </>
  );
}
