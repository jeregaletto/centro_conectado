import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type VarianteBoton = "primario" | "secundario" | "peligro" | "enlace";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-cc border-2 font-bold no-underline cursor-pointer " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-progress";

const VARIANTES: Record<VarianteBoton, string> = {
  primario: "border-tinta bg-tinta text-papel hover:bg-[#0b231e]",
  secundario: "border-tinta bg-papel text-tinta hover:bg-pared",
  peligro: "border-error bg-papel text-error hover:bg-error-fondo",
  enlace: "border-transparent bg-transparent text-tinta underline px-0! min-h-0!",
};

const TAMANOS = {
  normal: "min-h-toque px-5 text-[17px] simple:text-xl",
  chico: "min-h-10 px-3 text-[15px] simple:min-h-14 simple:text-lg",
} as const;

export function clasesBoton(variante: VarianteBoton = "primario", tamano: keyof typeof TAMANOS = "normal", ancho = false) {
  return `${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${ancho ? "w-full" : ""}`;
}

function Girando() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-[3px] border-current border-r-transparent"
    />
  );
}

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  tamano?: keyof typeof TAMANOS;
  ancho?: boolean;
  /** Mientras espera: deshabilitado, aria-busy y ruedita. Evita el doble envío. */
  ocupado?: boolean;
}

export function Boton({
  variante = "primario",
  tamano = "normal",
  ancho = false,
  ocupado = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...resto
}: PropsBoton) {
  return (
    <button
      type={type}
      disabled={disabled || ocupado}
      aria-busy={ocupado || undefined}
      className={`${clasesBoton(variante, tamano, ancho)} ${className}`}
      {...resto}
    >
      {children}
      {ocupado && <Girando />}
    </button>
  );
}

interface PropsEnlaceBoton {
  href: string;
  variante?: VarianteBoton;
  tamano?: keyof typeof TAMANOS;
  ancho?: boolean;
  className?: string;
  children: ReactNode;
  externo?: boolean;
}

/** Un enlace con aspecto de botón. Los externos abren en otra pestaña con rel seguro. */
export function EnlaceBoton({ href, variante = "primario", tamano = "normal", ancho, className = "", children, externo }: PropsEnlaceBoton) {
  const clases = `${clasesBoton(variante, tamano, ancho)} ${className}`;
  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={clases}>
        {children}
      </a>
    );
  }
  if (!href.startsWith("/")) {
    // tel:, mailto: y similares: enlace común, sin el router de Next.
    return (
      <a href={href} className={clases}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clases}>
      {children}
    </Link>
  );
}
