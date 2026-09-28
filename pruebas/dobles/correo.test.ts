import { describe, expect, it } from "vitest";
import { crearCorreoDePrueba, type MensajeCorreo } from "./correo";

const VERIFICACION: MensajeCorreo = {
  destinatario: "chef@casapepe.example",
  plantilla: "verificacion_correo",
  asunto: "Verifica tu correo en SafeMenu",
  cuerpo: "Confirma tu correo para acceder al panel de tu restaurante.",
  enlace: "https://safemenu.example/verificar?token=abc",
};

const RECUPERACION: MensajeCorreo = {
  destinatario: "chef@casapepe.example",
  plantilla: "recuperacion_contrasena",
  asunto: "Recupera tu contraseña en SafeMenu",
  cuerpo: "Solicita una contraseña nueva para tu cuenta.",
  enlace: "https://safemenu.example/recuperar?token=def",
};

describe("doble de correo", () => {
  it("guarda el mensaje enviado con todos sus campos", async () => {
    const correo = crearCorreoDePrueba();

    await correo.enviar(VERIFICACION);

    expect(correo.enviados).toEqual([VERIFICACION]);
    expect(correo.ultimoEnvio()).toEqual(VERIFICACION);
  });

  it("acepta las plantillas de verificación y de recuperación", async () => {
    const correo = crearCorreoDePrueba();

    await correo.enviar(VERIFICACION);
    await correo.enviar(RECUPERACION);

    expect(correo.enviados.map((mensaje) => mensaje.plantilla)).toEqual([
      "verificacion_correo",
      "recuperacion_contrasena",
    ]);
    expect(correo.ultimoEnvio()).toEqual(RECUPERACION);
  });

  it("devuelve el mismo mensaje para el mismo contenido y no inventa una plantilla", async () => {
    const correo = crearCorreoDePrueba();

    await correo.enviar(VERIFICACION);
    await correo.enviar(VERIFICACION);

    expect(correo.enviados[0]).toEqual(correo.enviados[1]);
  });

  it("no inventa mensajes genéricos distintos según el destinatario", async () => {
    const correo = crearCorreoDePrueba();

    await correo.enviar(VERIFICACION);
    await correo.enviar({ ...VERIFICACION, destinatario: "desconocido@example.org" });

    const [primero, segundo] = correo.enviados as [MensajeCorreo, MensajeCorreo];

    expect(segundo.asunto).toBe(primero.asunto);
    expect(segundo.cuerpo).toBe(primero.cuerpo);
  });

  it("falla en español y no registra nada cuando el envío falla", async () => {
    const correo = crearCorreoDePrueba({ escenario: "fallo" });

    await expect(correo.enviar(VERIFICACION)).rejects.toThrowError(
      "No se pudo enviar el correo.",
    );
    expect(correo.enviados).toEqual([]);
    expect(correo.ultimoEnvio()).toBeNull();
  });

  it("rechaza un destinatario vacío con un error en español", async () => {
    const correo = crearCorreoDePrueba();

    await expect(correo.enviar({ ...VERIFICACION, destinatario: " " })).rejects.toThrowError(
      "El destinatario del correo no puede estar vacío.",
    );
  });

  it("conserva el orden de muchos envíos seguidos", async () => {
    const correo = crearCorreoDePrueba();

    for (let indice = 1; indice <= 50; indice += 1) {
      await correo.enviar({ ...VERIFICACION, enlace: `https://safemenu.example/verificar?token=${indice}` });
    }

    expect(correo.enviados).toHaveLength(50);
    expect(correo.ultimoEnvio()?.enlace).toBe(
      "https://safemenu.example/verificar?token=50",
    );
  });

  it("falla con el escenario de fallo y no con el correcto, para que la comprobación no sea vacía", async () => {
    const correcto = crearCorreoDePrueba();
    const fallo = crearCorreoDePrueba({ escenario: "fallo" });

    await correcto.enviar(VERIFICACION);
    await expect(fallo.enviar(VERIFICACION)).rejects.toThrowError();

    expect(correcto.enviados).toHaveLength(1);
    expect(fallo.enviados).toHaveLength(0);
  });
});
