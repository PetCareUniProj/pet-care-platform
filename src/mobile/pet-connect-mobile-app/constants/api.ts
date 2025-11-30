// API Configuration Constants

import { Platform } from 'react-native';

/**
 * Get the correct localhost address based on platform
 * - Web: localhost
 * - Android emulator: 10.0.2.2 (special IP that maps to host localhost)
 * - iOS simulator: localhost
 * - Physical device: Use actual server IP/domain
 */
function getLocalhostAddress(): string {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  // iOS and others
  return 'localhost';
}

const LOCALHOST = getLocalhostAddress();

// Base URLs for microservices
export const CATALOG_API_URL = process.env.EXPO_PUBLIC_CATALOG_API_URL || `http://${LOCALHOST}:8888/`;
export const ORDERING_API_URL = process.env.EXPO_PUBLIC_ORDERING_API_URL || `http://${LOCALHOST}:8888/`;
export const BASKET_API_URL = process.env.EXPO_PUBLIC_BASKET_API_URL || `http://${LOCALHOST}:8888/`;
export const SUBSCRIPTION_API_URL = process.env.EXPO_PUBLIC_SUBSCRIPTION_API_URL || `http://${LOCALHOST}:8888/`;

// Legacy - for backward compatibility
export const API_BASE_URL = `http://${LOCALHOST}:8888/`;

// Keycloak URL
export const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL || `http://${LOCALHOST}:8080`;

export const API_ENDPOINTS = {
  // ============ Catalog API ============
  CATALOG: {
    BASE: '/api',
    ITEMS: {
      GET_ALL: '/api/catalog/items',
      GET_BY_ID: (idOrSlug: string) => `/api/catalog/items/${idOrSlug}`,
      GET_PICTURE: (id: number) => `${CATALOG_API_URL}/api/catalog/items/${id}/pic`,
    },
    CATEGORIES: {
      GET_ALL: '/api/catalog/category',
      GET_BY_ID: (id: number) => `/api/catalog/category/${id}`,
    },
    BRANDS: {
      GET_ALL: '/api/catalog/brand',
      GET_BY_ID: (id: number) => `/api/catalog/brand/${id}`,
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
  BASKET: {
    BASE: '/api/basket',
    GET: '/api/basket',
    ADD_ITEM: '/api/basket/items',
    UPDATE_ITEM: '/api/basket/items',
    DELETE_ITEM: '/api/basket/items',
  },

  // ============ Subscriptions ============
  SUBSCRIPTIONS: {
    BASE: '/api/subscriptions',
    GET_ALL: '/api/subscriptions',
    CREATE: '/api/subscriptions',
    DELETE: (id: string) => `/api/subscriptions/${id}`,
  },

  // ============ Pets API (Mocked) ============
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
    // Keycloak server configuration - dynamically resolved based on platform
    KEYCLOAK_BASE: KEYCLOAK_URL,
    REALM: process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'pet-care-platform',
    // Use public-client-web from Keycloak realm (public client, no secret required)
    CLIENT_ID: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'public-client-web',
    
    // Keycloak OIDC endpoints
    get AUTHORIZATION_ENDPOINT() {
      return `${this.KEYCLOAK_BASE}/realms/${this.REALM}/protocol/openid-connect/auth`;
    },
    get TOKEN_ENDPOINT() {
      return `${this.KEYCLOAK_BASE}/realms/${this.REALM}/protocol/openid-connect/token`;
    },
    get USERINFO_ENDPOINT() {
      return `${this.KEYCLOAK_BASE}/realms/${this.REALM}/protocol/openid-connect/userinfo`;
    },
    get LOGOUT_ENDPOINT() {
      return `${this.KEYCLOAK_BASE}/realms/${this.REALM}/protocol/openid-connect/logout`;
    },
  },
} as const;

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ============ App Configuration ============

/**
 * App deep link scheme
 * Must match the scheme in app.json
 */
export const APP_SCHEME = 'petconnectmobileapp';

/**
 * Trusted origins
 */
export const TRUSTED_ORIGINS = [
  `${APP_SCHEME}://`,
  'http://localhost:8081',
  `http://${LOCALHOST}:8081`,
];

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
  return `${CATALOG_API_URL}/images/${pictureFileName}`;
}

/**
 * Default placeholder image for products
 */
export const PRODUCT_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';
