/**
 * Authentication Store
 * 
 * Zustand store for managing authentication state,
 * user profile, and login/logout logic.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, LoginRequest } from '@types/user';
import * as authApi from '@api/auth';
import { storage } from '@utils/storage';

interface AuthState {
  // State
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      /**
       * Login with phone and verification code
       */
      login: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(phone, code);
          
          if (response.code === 0 && response.data) {
            const { token, user } = response.data;
            
            // Save token to storage
            storage.setToken(token);
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || '登录失败',
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '登录失败',
          });
          throw error;
        }
      },
      
      /**
       * Logout current user
       */
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout API errors
        } finally {
          // Clear storage
          storage.clearToken();
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
      
      /**
       * Check authentication status
       */
      checkAuth: async () => {
        const token = storage.getToken();
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        
        set({ token, isLoading: true });
        
        try {
          const response = await authApi.getProfile();
          
          if (response.code === 0 && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            storage.clearToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          storage.clearToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
      
      /**
       * Update user profile
       */
      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          const response = await authApi.updateProfile(data);
          
          if (response.code === 0 && response.data) {
            set({ user: response.data });
          } else {
            throw new Error(response.message);
          }
        } catch (error) {
          throw error;
        }
      },
      
      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'stockquant-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
