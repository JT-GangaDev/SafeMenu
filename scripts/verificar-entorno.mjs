/**
 * Comprobación de la configuración local (T-002).
 *
 * Valida `.env.local` y `.env` con el mismo módulo que usa la aplicación e
 * informa en español de las variables ausentes o no válidas, sin mostrar
 * ningún valor.
 */
import {
  ConfiguracionInvalidaError,
  validarEntorno,
} from "../infraestructura/configuracion/entorno.ts";

for (const archivo of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(archivo);
  } catch {
    // El archivo no existe: se ignora y se validan los que sí existan.
  }
}

try {
  const configuracion = validarEntorno(process.env);
  console.log("Configuración de entorno correcta.");
  console.log(`  Dirección pública: ${configuracion.urlPublica}`);
  console.log(`  Supabase: configurado (${configuracion.supabaseUrl})`);
  console.log(
    `  Modelo de IA: ${configuracion.openaiModel}. La clave de OpenAI no se muestra.`,
  );
  console.log(
    configuracion.smtp
      ? `  Correo SMTP: configurado en el puerto ${configuracion.smtp.puerto}`
      : "  Correo SMTP: sin configurar; se usará el correo configurado en Supabase.",
  );
  process.exit(0);
} catch (error) {
  if (error instanceof ConfiguracionInvalidaError) {
    console.error("La configuración de entorno no es válida.");
    console.error(error.message);
    process.exit(1);
  }
  console.error("No se ha podido comprobar la configuración de entorno.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
