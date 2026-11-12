/** Los e2e necesitan el backend real con los datos de demo (perfil dev). Si no está, cortamos con un mensaje claro. */
export default async function globalSetup() {
  const backend = process.env.BACKEND_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${backend}/actuator/health`);
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (e) {
    throw new Error(
      `El backend no responde en ${backend} (${String(e)}). Levantalo con "cd backend && mvn spring-boot:run" antes de correr los e2e.`,
    );
  }
}
