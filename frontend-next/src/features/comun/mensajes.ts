/**
 * Mensajes de validación idénticos a los que devuelve el backend (Hibernate Validator en es),
 * para que el error se vea igual venga de Zod o de `campos` del servidor.
 */
export const M = {
  vacio: "no debe estar vacío",
  nulo: "no debe ser nulo",
  tamano: (min: number, max: number) => `el tamaño debe estar entre ${min} y ${max}`,
  minimo: (n: number) => `debe ser mayor que o igual a ${n}`,
  maximo: (n: number) => `debe ser menor que o igual a ${n}`,
  email: "debe ser una dirección de correo electrónico con formato correcto",
} as const;
