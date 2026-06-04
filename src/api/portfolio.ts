/**
 * Portfolio API Module
 * 
 * Handles user portfolio management including
 * holdings, profit/loss calculation, and summary.
 */

import { get, post, put, del } from './client';
import type { ApiResponse } from '@types/api';
import type {
  PortfolioItem,
  PortfolioSummary,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
} from '@types/user';

/**
 * Get all portfolio holdings
 * 
 * @returns API response with portfolio holdings
 */
export async function getPortfolio(): Promise<ApiResponse<PortfolioItem[]>> {
  return get<PortfolioItem[]>('/portfolio');
}

/**
 * Get portfolio summary
 * 
 * @returns API response with portfolio summary
 */
export async function getPortfolioSummary(): Promise<ApiResponse<PortfolioSummary>> {
  return get<PortfolioSummary>('/portfolio/summary');
}

/**
 * Add new holding to portfolio
 * 
 * @param data - Holding data
 * @returns API response
 */
export async function addHolding(
  data: CreatePortfolioRequest
): Promise<ApiResponse<null>> {
  return post<null>('/portfolio', data);
}

/**
 * Update holding
 * 
 * @param id - Holding ID
 * @param data - Update data
 * @returns API response
 */
export async function updateHolding(
  id: number,
  data: UpdatePortfolioRequest
): Promise<ApiResponse<null>> {
  return put<null>(`/portfolio/${id}`, data);
}

/**
 * Delete holding
 * 
 * @param id - Holding ID
 * @returns API response
 */
export async function deleteHolding(id: number): Promise<ApiResponse<null>> {
  return del<null>(`/portfolio/${id}`);
}

/**
 * Get holding history (transactions)
 * 
 * @param id - Holding ID
 * @returns API response with transaction history
 */
export async function getHoldingHistory(
  id: number
): Promise<ApiResponse<{
  id: number;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  date: string;
  note?: string;
}[]>> {
  return get(`/portfolio/${id}/history`);
}

/**
 * Add transaction to holding
 * 
 * @param id - Holding ID
 * @param data - Transaction data
 * @returns API response
 */
export async function addTransaction(
  id: number,
  data: {
    type: 'buy' | 'sell';
    shares: number;
    price: number;
    date: string;
    note?: string;
  }
): Promise<ApiResponse<null>> {
  return post<null>(`/portfolio/${id}/transaction`, data);
}

/**
 * Import holdings from file
 * 
 * @param file - CSV file with holdings
 * @returns API response with import result
 */
export async function importHoldings(
  file: File
): Promise<ApiResponse<{
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return post('/portfolio/import', formData);
}

/**
 * Export holdings to file
 * 
 * @param format - Export format ('csv', 'excel')
 * @returns API response
 */
export async function exportHoldings(
  format: 'csv' | 'excel' = 'csv'
): Promise<ApiResponse<string>> {
  return get('/portfolio/export', { format });
}
