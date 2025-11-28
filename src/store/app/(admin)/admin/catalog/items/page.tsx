import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCatalogItems } from "@/lib/api/catalog";
import type { ItemResponse, ItemsResponse } from "@/lib/api/types/catalog";

type CatalogItemsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getSearchParamValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

type InventoryBadgeVariant = "secondary" | "outline" | "destructive";

function getInventoryStatus(item: ItemResponse): { label: string; variant: InventoryBadgeVariant } {
  if (item.availableStock === 0) {
    return { label: "Out of stock", variant: "destructive" };
  }

  if (item.availableStock <= item.restockThreshold) {
    return { label: "Low stock", variant: "destructive" };
  }

  if (item.onReorder) {
    return { label: "On reorder", variant: "outline" };
  }

  return { label: "Active", variant: "secondary" };
}

function formatPrice(price: number) {
  return currencyFormatter.format(price);
}

export default async function CatalogItemsPage({ searchParams }: CatalogItemsPageProps) {
  const resolvedParams = searchParams ?? {};
  const name = getSearchParamValue(resolvedParams.name);
  const brandId = parseNumber(getSearchParamValue(resolvedParams.brandId));
  const categoryId = parseNumber(getSearchParamValue(resolvedParams.categoryId));
  const page = parseNumber(getSearchParamValue(resolvedParams.page));
  const pageSize = parseNumber(getSearchParamValue(resolvedParams.pageSize));
  const sortBy = getSearchParamValue(resolvedParams.sortBy);

  let itemsResponse: ItemsResponse;
  let loadError: string | null = null;

  try {
    itemsResponse = await getCatalogItems({
      name,
      brandId,
      categoryId,
      sortBy,
      page,
      pageSize,
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load catalog items.";
    itemsResponse = {
      items: [],
      page: page ?? 1,
      pageSize: pageSize ?? 20,
      total: 0,
    };
  }

  const { items, total } = itemsResponse;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Catalog · Items</h1>
        <p className="text-muted-foreground text-sm">Create, update, or retire SKUs. Only admins reach the protected Catalog endpoints.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              Mirrors GET `/api/items` with filters and pagination. Showing {items.length} of {total} records.
            </CardDescription>
          </div>
          <Button>Create item</Button>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No catalog items match the selected filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const status = getInventoryStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.slug}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.availableStock}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
