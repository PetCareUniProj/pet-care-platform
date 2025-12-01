import PetShop from "@/app/store/products/PetShop";
import type { ItemsResponse } from "@/lib/api/types/catalog";
import { fetchCatalogBrands, fetchCatalogCategories, fetchCatalogItems } from "@/lib/server/catalog-service";

const DEFAULT_PAGE_SIZE = 12;

export default async function Page() {
    const [itemsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        fetchCatalogItems({ page: 1, pageSize: DEFAULT_PAGE_SIZE, sortBy: 'name' }).catch((error) => {
            console.error('Failed to preload catalog items for store page', error);
            return undefined;
        }),
        fetchCatalogCategories({ pageSize: 25 }).catch((error) => {
            console.error('Failed to preload catalog categories for store page', error);
            return undefined;
        }),
        fetchCatalogBrands({ pageSize: 25 }).catch((error) => {
            console.error('Failed to preload catalog brands for store page', error);
            return undefined;
        }),
    ]);

    const safeItemsResponse: ItemsResponse = itemsResponse ?? { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, hasNextPage: false };
    const storefrontCatalogApiBase = '/api/storefront/catalog';
    const storefrontBasketApiBase = '/api/storefront/basket';

    return (
        <PetShop
            basketApiUrl={storefrontBasketApiBase}
            catalogApiUrl={storefrontCatalogApiBase}
            initialItems={safeItemsResponse.items ?? []}
            initialCategories={categoriesResponse?.items ?? []}
            initialBrands={brandsResponse?.items ?? []}
            initialTotalItems={safeItemsResponse.total ?? 0}
            initialPage={safeItemsResponse.page ?? 1}
            pageSize={safeItemsResponse.pageSize ?? DEFAULT_PAGE_SIZE}
        />
    );
}
