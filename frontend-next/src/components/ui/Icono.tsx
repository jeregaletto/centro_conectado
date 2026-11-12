import type { ReactNode } from "react";

import type { NombreIcono } from "@/lib/iconos";

/**
 * Set único de íconos (SVG inline, trazo de 2 px sobre 24×24, color = currentColor).
 * Los de navegación conservan los nombres y dibujos de la versión HTML (login.html).
 */
const TRAZOS: Record<NombreIcono, ReactNode> = {
  casa: <path strokeLinejoin="round" d="M3 11 12 4l9 7v9h-6v-6H9v6H3z" />,
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  check: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 12 3 3 6-6" />
    </>
  ),
  flechas: <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h14l-3-3M20 16H6l3 3" />,
  buzon: (
    <g strokeLinejoin="round">
      <path d="M3 13V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5" />
      <path d="M3 13h5l1.5 3h5L16 13h5v6H3z" />
    </g>
  ),
  personas: (
    <g strokeLinecap="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M17.5 14c2.4 0 4 1.7 4 4.5" />
    </g>
  ),
  libro: (
    <g strokeLinejoin="round">
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7h6" />
    </g>
  ),
  mas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </>
  ),
  panel: (
    <g strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </g>
  ),
  menu: (
    <g fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </g>
  ),
  campana: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </g>
  ),
  volver: <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />,
  lugar: (
    <>
      <path strokeLinejoin="round" d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </>
  ),
  telefono: (
    <path
      strokeLinejoin="round"
      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
    />
  ),
  correo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinejoin="round" d="m3 7 9 6 9-6" />
    </>
  ),
  documento: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </g>
  ),
  fijado: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M9 3h6l-1 6 3 3H7l3-3z" />
      <path d="M12 12v9" />
    </g>
  ),
  salir: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </g>
  ),
  llave: (
    <g strokeLinecap="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l3 3M15 8l2 2" />
    </g>
  ),
  descargar: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  lupa: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-4-4" />
    </>
  ),
  banio: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5" r="2" />
      <path d="M5 21v-6H4l1.5-6h3L10 15H9v6" />
      <circle cx="17" cy="5" r="2" />
      <path d="M15.5 21v-7l-1-5h5l-1 5v7M12 3v18" />
    </g>
  ),
  basura: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
    </g>
  ),
  trapeador: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11M6 14h12l1 7H5z" />
      <path d="M9 21v-3M12 21v-3M15 21v-3" />
    </g>
  ),
  silla: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v9h10V3M6 12h12v3H6zM7 15v6M17 15v6" />
    </g>
  ),
  jabon: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3h4v3h-4zM12 6v2" />
      <rect x="6" y="8" width="12" height="13" rx="2" />
      <path d="M9 13h6" />
    </g>
  ),
  ventana: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M12 3v18M4 12h16" />
    </>
  ),
  caja: (
    <g strokeLinejoin="round">
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </g>
  ),
  carro: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.2 11h11l2-8H6" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </g>
  ),
  termometro: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z" />
      <path d="M12 9v7" />
    </g>
  ),
  pastilla: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7z" />
      <path d="M7 10l7 7" />
    </g>
  ),
};

interface PropsIcono {
  nombre: NombreIcono;
  className?: string;
  /** Si el ícono transmite información por sí solo, describilo. Si no, queda oculto a lectores de pantalla. */
  titulo?: string;
}

export function Icono({ nombre, className = "size-6", titulo }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`shrink-0 ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
