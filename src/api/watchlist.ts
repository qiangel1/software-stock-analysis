/**
 * Watchlist API Module
 * 
 * Handles watchlist operations.
 */

import { get, post, put, del } from './client';
import type { ApiResponse } from '@types/api';
import type { WatchlistItem } from '@types/user';

/**
 * Get user's watchlist
 * 
 * @returns API response with watchlist items
 */
export async function getWatchlist(): Promise<ApiResponse<WatchlistItem[]>> {
  return get<WatchlistItem[]>('/watchlist');
}

/**
 * Add stock to watchlist
 * 
 * @param data - Stock code and optional group name
 * @returns API response
 */
export async function addToWatchlist(data: {
  stock_code: string;
  group_name?: string;
}): Promise<ApiResponse<null>> {
  return post<null>('/watchlist', data);
}

/**
 * Remove stock from watchlist
 * 
 * @param id - Watchlist item ID
 * @returns API response
 */
export async function removeFromWatchlist(id: number): Promise<ApiResponse<null>> {
  return del<null>(`/watchlist/${id}`);
}

/**
 * Update watchlist item
 * 
 * @param id - Watchlist item ID
 * @param data - Update data
 * @returns API response
 */
export async function updateWatchlist(
  id: number,
  data: { group_name?: string; sort_order?: number }
): Promise<ApiResponse<null>> {
  return put<null>(`/watchlist/${id}`, data);
}

/**
 * Move watchlist items to a group
 * 
 * @param ids - Item IDs
 * @param groupName - Target group name
 * @returns API response
 */
export async function moveWatchlistToGroup(
  ids: number[],
  groupName: string
): Promise<ApiResponse<null>> {
  return put<null>('/watchlist/move', { ids, group_name: groupName });
}

/**
 * Create new watchlist group
 * 
 * @param name - Group name
 * @returns API response
 */
export async function createWatchlistGroup(name: string): Promise<ApiResponse<null>> {
  return post<null>('/watchlist/groups', { name });
}

/**
 * Delete watchlist group
 * 
 * @param name - Group name
 * @returns API response
 */
export async function deleteWatchlistGroup(name: string): Promise<ApiResponse<null>> {
  return del<null>(`/watchlist/groups/${name}`);
}
