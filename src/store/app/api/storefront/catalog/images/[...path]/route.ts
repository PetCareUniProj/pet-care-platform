import { NextRequest, NextResponse } from "next/server";

import { createCatalogResourceUrl } from "@/lib/server/catalog-service";

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const relativePath = params.path.join("/");
  try {
    const url = await createCatalogResourceUrl(`/images/${relativePath}`);
    const upstream = await fetch(url, { cache: "no-store" });
    const body = await upstream.arrayBuffer();
    const response = new NextResponse(body, { status: upstream.status });

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    response.headers.set("content-type", contentType);

    return response;
  } catch (error) {
    console.error("Catalog image proxy failed", error);
    return new NextResponse(undefined, { status: 404 });
  }
}
