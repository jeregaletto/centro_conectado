import type { Metadata } from "next";

import { PantallaMas } from "@/features/mas/PantallaMas";

export const metadata: Metadata = { title: "Más" };

export default function PaginaMas() {
  return <PantallaMas />;
}
