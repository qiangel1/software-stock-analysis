/**
 * Watchlist Store
 * 
 * Zustand store for managing user's watchlist
 * (自选股) including CRUD operations.
 */

import { create } from 'zustand';
import type { WatchlistItem, WatchlistGroup } from '@types/user';
import * as watchlistApi from '@api/watchlist';

interface WatchlistState {
  // State
  items: WatchlistItem[];
  groups: WatchlistGroup[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWatchlist: () => Promise<void>;
  addStock: (stockCode: string, groupName?: string) => Promise<void>;
  removeStock: (id: number) => Promise<void>;
  updateGroup: (id: number, groupName: string) => Promise<void>;
  moveToGroup: (ids: number[], groupName: string) => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  deleteGroup: (name: string) => Promise<void>;
  clearError: () => void;
}

export const useWatchlistStore = create<WatchlistState>()((set, get) => ({
  // Initial state
  items: [],
  groups: [],
  isLoading: false,
  error: null,
  
  /**
   * Fetch user's watchlist
   */
  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await watchlistApi.getWatchlist();
      
      if (response.code === 0 && response.data) {
        // Group items by group_name
        const groupMap: Record<string, WatchlistGroup> = {};
        
        response.data.forEach((item) => {
          const groupName = item.group_name || '默认';
          if (!groupMap[groupName]) {
            groupMap[groupName] = { name: groupName, count: 0 };
          }
          groupMap[groupName].count++;
        });
        
        set({
          items: response.data,
          groups: Object.values(groupMap),
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取自选股失败',
      });
    }
  },
  
  /**
   * Add stock to watchlist
   */
  addStock: async (stockCode: string, groupName?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await watchlistApi.addToWatchlist({
        stock_code: stockCode,
        group_name: groupName,
      });
      
      if (response.code === 0) {
        // Refresh watchlist
        await get().fetchWatchlist();
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '添加自选股失败',
      });
    }
  },
  
  /**
   * Remove stock from watchlist
   */
  removeStock: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await watchlistApi.removeFromWatchlist(id);
      
      if (response.code === 0) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除自选股失败',
      });
    }
  },
  
  /**
   * Update watchlist item group
   */
  updateGroup: async (id: number, groupName: string) => {
    try {
      const response = await watchlistApi.updateWatchlist(id, { group_name: groupName });
      
      if (response.code === 0) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, group_name: groupName } : item
          ),
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Move multiple items to a group
   */
  moveToGroup: async (ids: number[], groupName: string) => {
    try {
      for (const id of ids) {
        await watchlistApi.updateWatchlist(id, { group_name: groupName });
      }
      
      set((state) => ({
        items: state.items.map((item) =>
          ids.includes(item.id) ? { ...item, group_name: groupName } : item
        ),
      }));
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create new group
   */
  createGroup: async (name: string) => {
    set((state) => ({
      groups: [...state.groups, { name, count: 0 }],
    }));
  },
  
  /**
   * Delete group
   */
  deleteGroup: async (name: string) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.name !== name),
    }));
  },
  
  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
