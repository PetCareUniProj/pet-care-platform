import { auth } from "@/auth";
import { getServiceEndpoint } from "@/service-discovery";

export function ensureCatalogBaseUrl(): string {
  const catalogApiBaseUrl = getServiceEndpoint("catalog-api");
  if (!catalogApiBaseUrl) {
    throw new Error("Catalog endpoint not found. Start Aspire or register catalog-api.");
  }
  return catalogApiBaseUrl;
}

export async function ensureCatalogAccessToken(errorMessage: string): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error(errorMessage);
  }
  return session.accessToken;
}

export async function buildCatalogError(response: Response, fallbackMessage: string): Promise<Error> {
  const raw = await response.text();

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { detail?: unknown; title?: unknown; message?: unknown };
      const detail = typeof parsed.detail === "string" ? parsed.detail.trim() : "";
      const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
      const message = detail || title || (typeof parsed.message === "string" ? parsed.message.trim() : "");
      if (message) {
        return new Error(message);
      }
    } catch {
      // raw content is not JSON, ignore parse failure and fall through to raw text fallback.
    }

    const trimmed = raw.trim();
    if (trimmed) {
      return new Error(trimmed);
    }
  }

  return new Error(fallbackMessage);
}
