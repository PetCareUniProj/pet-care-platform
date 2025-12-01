export interface BasketItem {
  product_id: number;
  quantity: number;
  name?: string;
  price?: number;
  pictureFileName?: string;
}

export interface CustomerBasket {
  items: BasketItem[];
}

interface BasketClientOptions {
  resourcePath?: string;
}

export default class BasketClient {
  private readonly endpoint: string;

  constructor(baseUrl: string = "", options?: BasketClientOptions) {
    const normalizedBase = (baseUrl || process.env.NEXT_PUBLIC_BASKET_API_URL || "").replace(/\/+$/, "");
    const resourcePath = options?.resourcePath ?? "/api/basket";

    if (resourcePath) {
      const normalizedResource = resourcePath.startsWith("/") ? resourcePath : `/${resourcePath}`;
      this.endpoint = `${normalizedBase}${normalizedResource}` || normalizedResource;
    } else {
      this.endpoint = normalizedBase || "/api/basket";
    }
  }

  private buildUrl(path?: string) {
    if (!path) {
      return this.endpoint;
    }

    return `${this.endpoint}${path.startsWith("/") ? path : `/${path}`}`;
  }

  private async request<T>(path: string, init: RequestInit) {
    const url = this.buildUrl(path);
    const headers = new Headers(init.headers);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Basket request to ${url} failed with status ${response.status}${errorBody ? `: ${errorBody}` : ""}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async getBasket(): Promise<CustomerBasket> {
    return this.request<CustomerBasket>("", { method: "GET" });
  }

  async updateBasket(items: BasketItem[]): Promise<CustomerBasket> {
    return this.request<CustomerBasket>("", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  async addItem(productId: number, quantity: number = 1): Promise<CustomerBasket> {
    return this.request<CustomerBasket>("/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeItem(productId: number): Promise<CustomerBasket> {
    return this.request<CustomerBasket>(`/items/${productId}`, {
      method: "DELETE",
    });
  }

  async clearBasket(): Promise<void> {
    await this.request<void>("", { method: "DELETE" });
  }
}
