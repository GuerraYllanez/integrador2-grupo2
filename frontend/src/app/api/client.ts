const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const token = sessionStorage.getItem("odam_token");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {

    const contentType =
      response.headers.get("content-type") || "";

    const body =
      await response.text();

    let mensaje =
      `Error HTTP ${response.status}`;

    if (body) {

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {

          const data =
            JSON.parse(body);

          if (
            typeof data.message === "string"
          ) {
            mensaje = data.message;
          } else if (
            typeof data.error === "string"
          ) {
            mensaje = data.error;
          } else {
            mensaje = body;
          }

        } catch {

          mensaje = body;
        }

      } else {

        mensaje = body;
      }
    }

    throw new Error(mensaje);
  }

  if (
    response.status === 204 ||
    response.status === 205
  ) {
    return undefined as T;
  }

  const responseContentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !responseContentType.includes(
      "application/json"
    )
  ) {
    return undefined as T;
  }

  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export {
  API_URL
};