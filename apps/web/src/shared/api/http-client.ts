const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function httpClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data ?? new Error("Error en la petición");
  }

  return data as T;
}