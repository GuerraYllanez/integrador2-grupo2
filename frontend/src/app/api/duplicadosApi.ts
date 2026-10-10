
const API_URL = "http://localhost:8080/api/urgencias";

export interface RevisionDuplicidad {
  idRevision: number;
  idUrgenciaOriginal: number;
  idUrgenciaDuplicada: number;
  estadoRevision: string;
  fechaRevision: string;
}

interface RespuestaRegistro {
  mensaje?: string;
  idRevision?: number;
  idUrgenciaOriginal?: number;
  idUrgenciaDuplicada?: number;
  estadoRevision?: string;
  fechaRevision?: string;
}

function obtenerToken(): string {
  const token = sessionStorage.getItem("odam_token");

  if (!token) {
    throw new Error(
      "No se encontró la sesión. Inicia sesión nuevamente."
    );
  }

  return token;
}

/**
 * Interpreta los errores del backend sin mostrar toda la traza Java.
 */
async function procesarRespuesta<T>(
  respuesta: Response
): Promise<T> {
  const contenido = await respuesta.text();

  let datos: unknown;

  try {
    datos = contenido ? JSON.parse(contenido) : null;
  } catch {
    datos = contenido;
  }

  if (!respuesta.ok) {
    let mensaje = `Error del servidor (${respuesta.status}).`;

    if (typeof datos === "string" && datos.trim()) {
      mensaje = datos;
    } else if (datos && typeof datos === "object") {
      const error = datos as Record<string, unknown>;

      if (typeof error.message === "string") {
        mensaje = error.message;
      } else if (typeof error.mensaje === "string") {
        mensaje = error.mensaje;
      } else if (typeof error.error === "string") {
        mensaje = error.error;
      }
    }

    if (respuesta.status === 409) {
      mensaje = "Esta pareja de urgencias ya fue revisada.";
    }

    throw new Error(mensaje);
  }

  if (!contenido.trim()) {
    return undefined as T;
  }

  return datos as T;
}

/**
 * Registra la revisión sin eliminar ni modificar las urgencias originales.
 */
export async function registrarRevisionDuplicidad(
  idUrgenciaOriginal: number,
  idUrgenciaDuplicada: number
): Promise<RespuestaRegistro> {
  const respuesta = await fetch(
    `${API_URL}/duplicados/revisar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: JSON.stringify({
        idUrgenciaOriginal,
        idUrgenciaDuplicada,
      }),
    }
  );

  return procesarRespuesta<RespuestaRegistro>(respuesta);
}

/**
 * Obtiene las revisiones guardadas para distinguir los casos
 * pendientes de los que ya fueron revisados.
 */
export async function listarRevisionesDuplicidad():
  Promise<RevisionDuplicidad[]> {
  const respuesta = await fetch(
    `${API_URL}/duplicados`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${obtenerToken()}`,
      },
    }
  );

  return procesarRespuesta<RevisionDuplicidad[]>(respuesta);
}