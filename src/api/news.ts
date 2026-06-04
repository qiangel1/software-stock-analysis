/**
 * News API Module
 * 
 * Handles news and announcement data fetching.
 */

import { get } from './client';
import type { ApiResponse } from '@types/api';

/**
 * News item interface
 */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  /** Published timestamp */
  pub_time: string;
  /** Related stock codes */
  related_stocks: string[];
  /** News type: 'news', 'announcement', 'research' */
  type: 'news' | 'announcement' | 'research' | 'notice';
  /** Image URLs */
  images?: string[];
  /** URL to original article */
  url?: string;
  /** View count */
  view_count?: number;
  /** Comment count */
  comment_count?: number;
}

/**
 * Get news for specific stock
 * 
 * @param code - Stock code
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns API response with news list
 */
export async function getStockNews(
  code: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<NewsItem[]>> {
  return get<NewsItem[]>(`/news/${code}`, {
    page,
    page_size: pageSize,
  });
}

/**
 * Get market news
 * 
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns API response with news list
 */
export async function getMarketNews(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<NewsItem[]>> {
  return get<NewsItem[]>('/news/market', {
    page,
    page_size: pageSize,
  });
}

/**
 * Get hot news (trending)
 * 
 * @param limit - Maximum results
 * @returns API response with hot news list
 */
export async function getHotNews(limit: number = 10): Promise<ApiResponse<NewsItem[]>> {
  return get<NewsItem[]>('/news/hot', { limit });
}

/**
 * Get news detail
 * 
 * @param id - News ID
 * @returns API response with news detail
 */
export async function getNewsDetail(id: string): Promise<ApiResponse<NewsItem>> {
  return get<NewsItem>(`/news/detail/${id}`);
}

/**
 * Get announcements for stock
 * 
 * @param code - Stock code
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns API response with announcement list
 */
export async function getAnnouncements(
  code: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<NewsItem[]>> {
  return get<NewsItem[]>(`/news/announcements/${code}`, {
    page,
    page_size: pageSize,
  });
}

/**
 * Search news
 * 
 * @param keyword - Search keyword
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns API response with search results
 */
export async function searchNews(
  keyword: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<NewsItem[]>> {
  return get<NewsItem[]>('/news/search', {
    keyword,
    page,
    page_size: pageSize,
  });
}

/**
 * Get news categories
 * 
 * @returns API response with news categories
 */
export async function getNewsCategories(): Promise<ApiResponse<{
  id: string;
  name: string;
  icon: string;
}[]>> {
  return get('/news/categories');
}
