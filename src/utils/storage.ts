/**
 * Storage Utility
 * 
 * LocalStorage wrapper with type safety.
 */

const TOKEN_KEY = 'stockquant_token';

/**
 * Get auth token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set auth token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear auth token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if token exists
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Storage utility object
 */
export const storage = {
  getToken,
  setToken,
  clearToken,
  hasToken,
};
