// Authentication types for Better Auth integration

/**
 * User type from Better Auth
 * Extended with additional fields for the app
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Session type from Better Auth
 */
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Auth tokens (for legacy compatibility)
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Auth state for Zustand store
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Keycloak user info (OIDC standard claims)
 */
export interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'keycloak' | 'google' | 'apple' | 'github';
