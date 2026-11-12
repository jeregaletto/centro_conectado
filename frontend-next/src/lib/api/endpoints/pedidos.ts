import { qs, type Http } from "../client";
import type { CrearPedidoRequest, EstadoPedido, Pedido, PedidoDetalle } from "@/lib/tipos";

export const pedidos = (http: Http) => ({
  recibidos: (estado?: EstadoPedido) => http.pedir<Pedido[]>("GET", "/pedidos/recibidos" + qs({ estado })),
  enviados: (estado?: EstadoPedido) => http.pedir<Pedido[]>("GET", "/pedidos/enviados" + qs({ estado })),
  todos: (estado?: EstadoPedido) => http.pedir<Pedido[]>("GET", "/pedidos/todos" + qs({ estado })),
  detalle: (id: number) => http.pedir<PedidoDetalle>("GET", `/pedidos/${id}`),
  crear: (datos: CrearPedidoRequest) => http.pedir<PedidoDetalle>("POST", "/pedidos", datos),
  cambiarEstado: (id: number, estado: EstadoPedido, comentario: string | null) =>
    http.pedir<PedidoDetalle>("PATCH", `/pedidos/${id}/estado`, { estado, comentario }),
  comentar: (id: number, comentario: string) =>
    http.pedir<PedidoDetalle>("POST", `/pedidos/${id}/comentarios`, { comentario }),
});
