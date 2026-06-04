/**
 * Portfolio Store
 * 
 * Zustand store for managing user's stock portfolio
 * (持仓) including holdings and profit/loss calculation.
 */

import { create } from 'zustand';
import type { PortfolioItem, PortfolioSummary, CreatePortfolioRequest } from '@types/user';
import * as portfolioApi from '@api/portfolio';

interface PortfolioState {
  // State
  holdings: PortfolioItem[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPortfolio: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  addHolding: (data: CreatePortfolioRequest) => Promise<void>;
  updateHolding: (id: number, data: Partial<CreatePortfolioRequest>) => Promise<void>;
  deleteHolding: (id: number) => Promise<void>;
  refreshPrices: () => Promise<void>;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  // Initial state
  holdings: [],
  summary: null,
  isLoading: false,
  error: null,
  
  /**
   * Fetch all portfolio holdings
   */
  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.getPortfolio();
      
      if (response.code === 0 && response.data) {
        set({
          holdings: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取持仓失败',
      });
    }
  },
  
  /**
   * Fetch portfolio summary
   */
  fetchSummary: async () => {
    try {
      const response = await portfolioApi.getPortfolioSummary();
      
      if (response.code === 0 && response.data) {
        set({ summary: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  },
  
  /**
   * Add new holding
   */
  addHolding: async (data: CreatePortfolioRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.addHolding(data);
      
      if (response.code === 0) {
        // Refresh portfolio and summary
        await get().fetchPortfolio();
        await get().fetchSummary();
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '添加持仓失败',
      });
    }
  },
  
  /**
   * Update holding
   */
  updateHolding: async (id: number, data: Partial<CreatePortfolioRequest>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.updateHolding(id, data);
      
      if (response.code === 0) {
        // Refresh portfolio and summary
        await get().fetchPortfolio();
        await get().fetchSummary();
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '更新持仓失败',
      });
    }
  },
  
  /**
   * Delete holding
   */
  deleteHolding: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.deleteHolding(id);
      
      if (response.code === 0) {
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
          isLoading: false,
        }));
        await get().fetchSummary();
      } else {
        set({ isLoading: false, error: response.message });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除持仓失败',
      });
    }
  },
  
  /**
   * Refresh current prices for all holdings
   */
  refreshPrices: async () => {
    const { holdings } = get();
    
    if (holdings.length === 0) return;
    
    try {
      const codes = holdings.map((h) => h.stock_code);
      const response = await portfolioApi.getPortfolio();
      
      if (response.code === 0 && response.data) {
        set({ holdings: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  },
  
  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
