import ProductDetailsClient from '@/app/store/products/ProductDetailsClient';
import type { BrandResponse, CategoryResponse, ItemResponse } from '@/lib/api/types/catalog';
import { fetchCatalogBrand, fetchCatalogCategory, fetchCatalogItem } from '@/lib/server/catalog-service';

const STOREFRONT_CATALOG_API_BASE = '/api/storefront/catalog';
const STOREFRONT_BASKET_API_BASE = '/api/storefront/basket';

interface ProductSlugPageProps {
    params: {
        slug: string;
    };
}

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
    const aParams = await params;
    const slug = decodeURIComponent(aParams.slug);
    let product: ItemResponse | null = null;
    let brand: BrandResponse | null = null;
    let categories: CategoryResponse[] = [];
    let errorMessage = '';

    try {
        product = await fetchCatalogItem(slug);
    } catch (error) {
        console.error(`Failed to fetch catalog item for slug ${slug}`, error);
        errorMessage = error instanceof Error ? error.message : "Failed to load product.";
    }

    if (product) {
        if (product.catalogBrandId) {
            try {
                brand = await fetchCatalogBrand(product.catalogBrandId);
            } catch (error) {
                console.error(`Failed to fetch catalog brand ${product.catalogBrandId} for slug ${slug}`, error);
            }
        }

        if (product.categoryIds && product.categoryIds.length > 0) {
            const categoryResults = await Promise.all(
                product.categoryIds.map(async (categoryId) => {
                    try {
                        return await fetchCatalogCategory(categoryId);
                    } catch (error) {
                        console.error(`Failed to fetch catalog category ${categoryId} for slug ${slug}`, error);
                        return null;
                    }
                })
            );

            categories = categoryResults.filter((category): category is CategoryResponse => category !== null);
        }
    }

    return (
        <ProductDetailsClient
            initialProduct={product}
            initialBrand={brand}
            initialCategories={categories}
            catalogApiUrl={STOREFRONT_CATALOG_API_BASE}
            basketApiUrl={STOREFRONT_BASKET_API_BASE}
            initialError={errorMessage}
        />
    );
}

