import { getAuthToken } from "../../config/auth-token";
import { env } from "../../config/env";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
    const message =
      body && typeof body.error === "string" ? body.error : `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
