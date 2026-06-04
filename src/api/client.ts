/**
 * API Client Module
 * 
 * Axios instance configuration with interceptors,
 * request/response handling, and error management.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { storage } from '@utils/storage';
import { ApiResponse, ErrorCode, ErrorMessages } from '@types/api';

/**
 * API base URL from environment
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Request timeout in milliseconds
 */
const TIMEOUT = 30000;

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor
 * 
 * Adds authentication token to all requests.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header if token exists
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for cache busting
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 
 * Handles unified API response format and errors.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return response data directly for successful requests
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      toast.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Token expired or invalid
        if (data?.code === ErrorCode.AUTH_TOKEN_EXPIRED) {
          storage.clearToken();
          window.location.href = '/login';
          toast.error('登录已过期，请重新登录');
        } else {
          toast.error(data?.message || '认证失败');
        }
        break;
        
      case 403:
        toast.error(data?.message || '权限不足');
        break;
        
      case 404:
        toast.error(data?.message || '资源不存在');
        break;
        
      case 422:
        toast.error(data?.message || '参数验证失败');
        break;
        
      case 429:
        toast.error(data?.message || '请求过于频繁，请稍后重试');
        break;
        
      case 500:
      case 502:
      case 503:
        toast.error('服务器错误，请稍后重试');
        break;
        
      default:
        // Handle business logic errors from API response
        if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error('请求失败，请稍后重试');
        }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: { showLoading?: boolean; showError?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic POST request
 */
export async function post<T>(
  url: string,
  data?: unknown,
  options?: { showLoading?: boolean; showError?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic PUT request
 */
export async function put<T>(
  url: string,
  data?: unknown,
  options?: { showLoading?: boolean; showError?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic DELETE request
 */
export async function del<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: { showLoading?: boolean; showError?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Download file request
 */
export async function downloadFile(
  url: string,
  params?: Record<string, unknown>,
  filename?: string
): Promise<void> {
  const response = await apiClient.get(url, {
    params,
    responseType: 'blob',
  });
  
  // Create download link
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export default apiClient;
