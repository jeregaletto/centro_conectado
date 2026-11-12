import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--fuente-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Centro Conectado", template: "%s · Centro Conectado" },
  description: "Comunicación interna del Centro: avisos, agenda, pedidos y buzón.",
};

export const viewport: Viewport = {
  themeColor: "#12302A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={atkinson.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
