// Product types

export interface Product {
  id: number;
  slug: string;
  name: string;
  description?: string;
  price: number;
  pictureUrl?: string;
  stock: number;
  brandId?: number;
  brand?: Brand;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

export interface ProductSortOption {
  field: 'price' | 'name' | 'createdAt';
  order: 'asc' | 'desc';
}


