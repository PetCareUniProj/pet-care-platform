import { auth } from "@/auth";

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  public constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface ApiRequestInit extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
  skipAuth?: boolean;
}

function buildUrl(baseUrl: string, path: string, query?: URLSearchParams) {
  const url = new URL(path, baseUrl);
  if (query && [...query.keys()].length > 0) {
    url.search = query.toString();
  }
  return url;
}

export function createApiClient(envKey: string) {
  async function getBaseUrl() {
    const baseUrl = process.env[envKey];
    if (!baseUrl) {
      throw new Error(`Missing ${envKey}. Ensure Aspire wires this env variable before starting the Store app.`);
    }
    return baseUrl;
  }

  async function request<T>(path: string, init: ApiRequestInit = {}, query?: URLSearchParams) {
    const baseUrl = await getBaseUrl();
    const url = buildUrl(baseUrl, path, query);

    const session = init.skipAuth ? undefined : await auth();
    const headers = new Headers(init.headers);

    if (!init.skipAuth) {
      if (!session?.accessToken) {
        throw new Error("Missing access token. Sign in again or verify NextAuth configuration.");
      }
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...init,
      headers,
      cache: init.cache ?? "no-store",
    });

    if (!response.ok) {
      let details: unknown;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          details = await response.json();
        } catch {
          details = await response.text();
        }
      } else {
        details = await response.text();
      }
      throw new ApiError(`Request to ${url.pathname} failed with status ${response.status}.`, response.status, details);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    const text = await response.text();
    return text as T;
  }

  return {
    request,
  };
}
