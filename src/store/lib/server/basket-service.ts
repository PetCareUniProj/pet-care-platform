"use server";

import "server-only";

import path from "node:path";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { auth } from "@/auth";
import type { BasketItem, CustomerBasket } from "@/lib/basket-client";
import { getServiceEndpoint } from "@/service-discovery";

const PROTO_PATH = path.join(process.cwd(), "proto", "basket.proto");
const DEFAULT_BASKET_GRPC_ADDRESS =
  process.env.BASKET_API_GRPC_ADDRESS ?? process.env.NEXT_PUBLIC_BASKET_API_BASE_URL ?? "http://localhost:5001";

type UnaryMethod<TRequest, TResponse> = {
  (request: TRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: TResponse) => void):
    | grpc.ClientUnaryCall;
  (request: TRequest, callback: (error: grpc.ServiceError | null, response: TResponse) => void): grpc.ClientUnaryCall;
};

type GrpcBasketItem = {
  product_id: number;
  quantity: number;
};

type CustomerBasketResponse = {
  items?: GrpcBasketItem[];
};

type BasketGrpcClient = grpc.Client & {
  GetBasket: UnaryMethod<Record<string, never>, CustomerBasketResponse>;
  UpdateBasket: UnaryMethod<{ items: GrpcBasketItem[] }, CustomerBasketResponse>;
  DeleteBasket: UnaryMethod<Record<string, never>, Record<string, never>>;
};

type BasketGrpcNamespace = {
  Basket: new (address: string, credentials: grpc.ChannelCredentials) => BasketGrpcClient;
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as grpc.GrpcObject & {
  BasketApi: BasketGrpcNamespace;
};

const BasketApi = protoDescriptor.BasketApi;

let basketClient: BasketGrpcClient | undefined;

function resolveBasketGrpcEndpoint(): string {
  const endpoint = getServiceEndpoint("basket-api") ?? DEFAULT_BASKET_GRPC_ADDRESS;
  console.log(`Using basket gRPC endpoint: ${endpoint}`);
  if (!endpoint) {
    throw new Error("Basket service endpoint is not configured.");
  }

  return endpoint;
}

function normalizeGrpcTarget(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    const url = new URL(endpoint);
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    console.log(`Normalized gRPC target host: ${url.hostname}, port: ${port}`);
    return `${url.hostname}:${port}`;
  }

  return endpoint;
}

function createBasketClient(): BasketGrpcClient {
  if (!basketClient) {
    const target = normalizeGrpcTarget(resolveBasketGrpcEndpoint());
    basketClient = new BasketApi.Basket(target, grpc.credentials.createInsecure());
  }

  return basketClient;
}

async function createMetadata() {
  const session = await auth();
  if (!session?.accessToken) {
    return undefined;
  }

  const metadata = new grpc.Metadata();
  metadata.add("Authorization", `Bearer ${session.accessToken}`);
  return metadata;
}

async function callUnary<TRequest, TResponse>(
  accessor: (client: BasketGrpcClient) => UnaryMethod<TRequest, TResponse>,
  request: TRequest,
): Promise<TResponse> {
  const client = createBasketClient();
  const metadata = await createMetadata();
  const method = accessor(client);

  return new Promise<TResponse>((resolve, reject) => {
    const callback = (error: grpc.ServiceError | null, response: TResponse) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    };

    const boundMethod = method.bind(client);
    if (metadata) {
      boundMethod(request, metadata, callback);
    } else {
      boundMethod(request, callback);
    }
  });
}

function assertPositiveInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function sanitizeItems(items: BasketItem[]): GrpcBasketItem[] {
  if (!Array.isArray(items)) {
    throw new Error("Items payload must be an array.");
  }

  return items.map((item) => {
    assertPositiveInteger(item.product_id, "product_id");
    assertPositiveInteger(item.quantity, "quantity");

    return {
      product_id: item.product_id,
      quantity: item.quantity,
    };
  });
}

function normalizeBasket(response?: CustomerBasketResponse): CustomerBasket {
  const items = Array.isArray(response?.items) ? response?.items : [];
  return {
    items: items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    })),
  };
}

export async function fetchCustomerBasket(): Promise<CustomerBasket> {
  const response = await callUnary((client) => client.GetBasket, {});
  return normalizeBasket(response);
}

export async function updateCustomerBasket(items: BasketItem[]): Promise<CustomerBasket> {
  const payload = sanitizeItems(items);
  const response = await callUnary((client) => client.UpdateBasket, { items: payload });
  return normalizeBasket(response);
}

export async function clearCustomerBasket(): Promise<void> {
  await callUnary((client) => client.DeleteBasket, {});
}

export async function addBasketItem(productId: number, quantity: number): Promise<CustomerBasket> {
  assertPositiveInteger(productId, "productId");
  assertPositiveInteger(quantity, "quantity");

  const basket = await fetchCustomerBasket();
  const existingItem = basket.items.find((item) => item.product_id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    basket.items.push({ product_id: productId, quantity });
  }

  return updateCustomerBasket(basket.items);
}

export async function removeBasketItem(productId: number): Promise<CustomerBasket> {
  assertPositiveInteger(productId, "productId");

  const basket = await fetchCustomerBasket();
  const filteredItems = basket.items.filter((item) => item.product_id !== productId);

  if (filteredItems.length === basket.items.length) {
    return basket;
  }

  if (filteredItems.length === 0) {
    await clearCustomerBasket();
    return { items: [] };
  }

  return updateCustomerBasket(filteredItems);
}
