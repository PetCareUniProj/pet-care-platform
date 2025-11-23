// API Configuration Constants

// Base URLs for microservices
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Catalog API
  CATALOG: {
    BASE: `${API_BASE_URL}/api`,
    ITEMS: {
      GET_ALL: `${API_BASE_URL}/api/items`,
      GET_BY_ID: (idOrSlug: string) => `${API_BASE_URL}/api/items/${idOrSlug}`,
      GET_PICTURE: (id: number) => `${API_BASE_URL}/api/items/${id}/pic`,
    },
    CATEGORIES: {
      GET_ALL: `${API_BASE_URL}/api/category`,
      GET_BY_ID: (id: number) => `${API_BASE_URL}/api/category/${id}`,
    },
    BRANDS: {
      GET_ALL: `${API_BASE_URL}/api/brand`,
      GET_BY_ID: (id: number) => `${API_BASE_URL}/api/brand/${id}`,
    },
  },

  // Basket API
  BASKET: {
    BASE: `${API_BASE_URL}/api/basket`,
    GET: `${API_BASE_URL}/api/basket`,
    ADD_ITEM: `${API_BASE_URL}/api/basket/items`,
    UPDATE_ITEM: `${API_BASE_URL}/api/basket/items`,
    DELETE_ITEM: `${API_BASE_URL}/api/basket/items`,
  },

  // Ordering API
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    CREATE_DRAFT: `${API_BASE_URL}/api/orders/draft`,
    CREATE: `${API_BASE_URL}/api/orders`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
    GET_BY_USER: `${API_BASE_URL}/api/orders/user/me`,
    CANCEL: (id: number) => `${API_BASE_URL}/api/orders/cancel/${id}`,
    SHIP: (id: number) => `${API_BASE_URL}/api/orders/ship/${id}`,
    GET_CARD_TYPES: `${API_BASE_URL}/api/orders/cardtypes`,
  },

  // Subscription API
  SUBSCRIPTIONS: {
    BASE: `${API_BASE_URL}/api/subscriptions`,
    GET_ALL: `${API_BASE_URL}/api/subscriptions`,
    CREATE: `${API_BASE_URL}/api/subscriptions`,
    DELETE: (id: string) => `${API_BASE_URL}/api/subscriptions/${id}`,
  },

  // Pets API (to be implemented on backend)
  PETS: {
    BASE: `${API_BASE_URL}/api/pets`,
    GET_ALL: `${API_BASE_URL}/api/pets`,
    CREATE: `${API_BASE_URL}/api/pets`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/pets/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/pets/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/pets/${id}`,
    UPLOAD_PHOTO: (id: string) => `${API_BASE_URL}/api/pets/${id}/photo`,
  },

  // Reminders API (to be implemented on backend)
  REMINDERS: {
    BASE: `${API_BASE_URL}/api/reminders`,
    GET_ALL: `${API_BASE_URL}/api/reminders`,
    CREATE: `${API_BASE_URL}/api/reminders`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/reminders/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/reminders/${id}`,
    COMPLETE: (id: string) => `${API_BASE_URL}/api/reminders/${id}/complete`,
  },

  // Calendar API (to be implemented on backend)
  CALENDAR: {
    GET_EVENTS: `${API_BASE_URL}/api/calendar/events`,
  },

  // Keycloak Auth
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


