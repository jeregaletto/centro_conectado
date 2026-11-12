import { redirect } from "next/navigation";

/** La raíz no tiene contenido: el proxy ya mandó al login si no hay sesión. */
export default function Raiz() {
  redirect("/inicio");
}
