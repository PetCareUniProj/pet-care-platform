import { NextResponse } from "next/server";

import { fetchCatalogItem } from "@/lib/server/catalog-service";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const data = await fetchCatalogItem(params.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Catalog item proxy failed", error);
    return NextResponse.json(
      { message: "Unable to load catalog item." },
      { status: 502 },
    );
  }
}
