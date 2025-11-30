import { NextRequest, NextResponse } from "next/server";

import { fetchCatalogItems } from "@/lib/server/catalog-service";

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const params = {
    name: search.get("Name") ?? search.get("name") ?? undefined,
    brandId: parseNumber(search.get("BrandId") ?? search.get("brandId")),
    categoryId: parseNumber(search.get("CategoryId") ?? search.get("categoryId")),
    sortBy: search.get("SortBy") ?? search.get("sortBy") ?? undefined,
    page: parseNumber(search.get("Page") ?? search.get("page")),
    pageSize: parseNumber(search.get("PageSize") ?? search.get("pageSize")),
  };

  try {
    const data = await fetchCatalogItems(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Catalog items proxy failed", error);
    return NextResponse.json(
      { message: "Unable to load catalog items." },
      { status: 502 },
    );
  }
}
