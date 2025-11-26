// API Configuration Constants

// Base URLs for microservices
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // ============ Catalog API ============
  CATALOG: {
    BASE: '/api',
    ITEMS: {
      GET_ALL: '/api/items',
      GET_BY_ID: (idOrSlug: string) => `/api/items/${idOrSlug}`,
      GET_PICTURE: (id: number) => `${API_BASE_URL}/api/items/${id}/pic`,
    },
    CATEGORIES: {
      GET_ALL: '/api/category',
      GET_BY_ID: (id: number) => `/api/category/${id}`,
    },
    BRANDS: {
      GET_ALL: '/api/brand',
      GET_BY_ID: (id: number) => `/api/brand/${id}`,
    },
  },

  // ============ Ordering API ============
  ORDERS: {
    BASE: '/api/orders',
    CREATE_DRAFT: '/api/orders/draft',
    CREATE: '/api/orders',
    GET_BY_ID: (id: number) => `/api/orders/${id}`,
    GET_BY_USER: '/api/orders/user/me',
    GET_BY_USER_ID: (userId: string) => `/api/orders/user/${userId}`,
    CANCEL: (id: number) => `/api/orders/cancel/${id}`,
    SHIP: (id: number) => `/api/orders/ship/${id}`,
    GET_CARD_TYPES: '/api/orders/cardtypes',
  },

  // ============ Basket (Local storage) ============
  // Note: Basket is managed locally, not through API
  // Use ordersService.createDraft() to convert basket to order draft
  BASKET: {
    BASE: '/api/basket',
    GET: '/api/basket',
    ADD_ITEM: '/api/basket/items',
    UPDATE_ITEM: '/api/basket/items',
    DELETE_ITEM: '/api/basket/items',
  },

  // ============ Subscriptions ============
  // Note: Subscriptions are recurring orders, managed through Orders API
  SUBSCRIPTIONS: {
    BASE: '/api/subscriptions',
    GET_ALL: '/api/subscriptions',
    CREATE: '/api/subscriptions',
    DELETE: (id: string) => `/api/subscriptions/${id}`,
  },

  // ============ Pets API (Mocked) ============
  // Pet profiles are mocked since there's no veterinary clinic backend
  PETS: {
    BASE: '/api/pets',
    GET_ALL: '/api/pets',
    CREATE: '/api/pets',
    GET_BY_ID: (id: string) => `/api/pets/${id}`,
    UPDATE: (id: string) => `/api/pets/${id}`,
    DELETE: (id: string) => `/api/pets/${id}`,
    UPLOAD_PHOTO: (id: string) => `/api/pets/${id}/photo`,
  },

  // ============ Reminders API (Mocked) ============
  // Reminders are mocked since there's no veterinary clinic backend
  REMINDERS: {
    BASE: '/api/reminders',
    GET_ALL: '/api/reminders',
    CREATE: '/api/reminders',
    UPDATE: (id: string) => `/api/reminders/${id}`,
    DELETE: (id: string) => `/api/reminders/${id}`,
    COMPLETE: (id: string) => `/api/reminders/${id}/complete`,
  },

  // ============ Calendar API (Mocked) ============
  CALENDAR: {
    GET_EVENTS: '/api/calendar/events',
  },

  // ============ Keycloak Auth ============
  AUTH: {
    KEYCLOAK_BASE: process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
    REALM: process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'pet-care-platform',
    CLIENT_ID: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'pet-connect-mobile',
  },
} as const;

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ============ Helpers ============

/**
 * Build full URL for product image
 * @param pictureFileName - Picture file name from CatalogItem
 * @returns Full URL to the image
 */
export function getProductImageUrl(pictureFileName: string | null | undefined): string | undefined {
  if (!pictureFileName) return undefined;
  // If it's already a full URL, return as is
  if (pictureFileName.startsWith('http')) return pictureFileName;
  // Otherwise, build URL from base
  return `${API_BASE_URL}/images/${pictureFileName}`;
}

/**
 * Default placeholder image for products
 */
export const PRODUCT_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';
