import { NextResponse } from "next/server";

import { fetchCatalogCategory } from "@/lib/server/catalog-service";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  const categoryId = Number(params.id);
  if (Number.isNaN(categoryId)) {
    return NextResponse.json({ message: "Category id must be numeric." }, { status: 400 });
  }

  try {
    const data = await fetchCatalogCategory(categoryId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Catalog category proxy failed", error);
    return NextResponse.json(
      { message: "Unable to load catalog category." },
      { status: 502 },
    );
  }
}
