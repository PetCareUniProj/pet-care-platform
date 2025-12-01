import { NextRequest, NextResponse } from "next/server";

import { fetchCatalogCategories } from "@/lib/server/catalog-service";

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
    page: parseNumber(search.get("Page") ?? search.get("page")),
    pageSize: parseNumber(search.get("PageSize") ?? search.get("pageSize")),
    sortBy: search.get("SortBy") ?? search.get("sortBy") ?? undefined,
  };

  try {
    const data = await fetchCatalogCategories(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Catalog categories proxy failed", error);
    return NextResponse.json(
      { message: "Unable to load catalog categories." },
      { status: 502 },
    );
  }
}
