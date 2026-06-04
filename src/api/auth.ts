/**
 * Authentication API Module
 * 
 * Handles user authentication, login, logout,
 * and profile management.
 */

import { get, post, put } from './client';
import type { ApiResponse } from '@types/api';
import type { User, UserProfile, LoginRequest, LoginResponse, SendCodeRequest } from '@types/user';

/**
 * Send verification code to phone number
 * 
 * @param phone - User phone number
 * @returns API response
 */
export async function sendVerificationCode(phone: string): Promise<ApiResponse<null>> {
  return post<null>('/auth/send_code', { phone } as SendCodeRequest);
}

/**
 * Login with phone and verification code
 * 
 * @param phone - User phone number
 * @param code - Verification code
 * @returns API response with token and user info
 */
export async function login(phone: string, code: string): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse>('/auth/login', { phone, code } as LoginRequest);
}

/**
 * Logout current user
 * 
 * @returns API response
 */
export async function logout(): Promise<ApiResponse<null>> {
  return post<null>('/auth/logout');
}

/**
 * Get current user profile
 * 
 * @returns API response with user profile
 */
export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  return get<UserProfile>('/auth/profile');
}

/**
 * Update user profile
 * 
 * @param data - Profile update data
 * @returns API response with updated profile
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
  return put<UserProfile>('/auth/profile', data);
}

/**
 * Change phone number
 * 
 * @param newPhone - New phone number
 * @param code - Verification code for new phone
 * @returns API response
 */
export async function changePhone(newPhone: string, code: string): Promise<ApiResponse<null>> {
  return post<null>('/auth/change_phone', { phone: newPhone, code });
}

/**
 * Refresh authentication token
 * 
 * @returns API response with new token
 */
export async function refreshToken(): Promise<ApiResponse<{ token: string }>> {
  return post<{ token: string }>('/auth/refresh');
}

/**
 * Get user settings
 * 
 * @returns API response with user settings
 */
export async function getSettings(): Promise<ApiResponse<Record<string, unknown>>> {
  return get<Record<string, unknown>>('/auth/settings');
}

/**
 * Update user settings
 * 
 * @param settings - Settings to update
 * @returns API response
 */
export async function updateSettings(settings: Record<string, unknown>): Promise<ApiResponse<null>> {
  return put<null>('/auth/settings', settings);
}
