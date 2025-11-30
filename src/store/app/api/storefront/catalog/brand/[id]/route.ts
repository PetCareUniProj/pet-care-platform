import { NextResponse } from "next/server";

import { fetchCatalogBrand } from "@/lib/server/catalog-service";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  const brandId = Number(params.id);
  if (Number.isNaN(brandId)) {
    return NextResponse.json({ message: "Brand id must be numeric." }, { status: 400 });
  }

  try {
    const data = await fetchCatalogBrand(brandId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Catalog brand proxy failed", error);
    return NextResponse.json(
      { message: "Unable to load catalog brand." },
      { status: 502 },
    );
  }
}
