import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'lilam_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normalizes any axios/NestJS error into a single human-readable string.
 * class-validator errors arrive as { message: string[] }.
 */
export function errorMessage(err) {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string') return message;
  if (err?.response?.status === 401) return 'Please log in to continue.';
  return err?.message || 'Something went wrong. Please try again.';
}
