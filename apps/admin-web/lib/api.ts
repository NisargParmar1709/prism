import axios from 'axios';
import { insforge } from './insforge';
// We MUST use the Next.js proxy to securely attach the httpOnly auth cookie
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh session explicitly
        const { data, error: refreshError } = await (insforge.auth as any).refreshSession();
        
        if (refreshError || !data?.session?.access_token) {
          await insforge.auth.signOut();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
        
        // Sync the new token with the Next.js proxy cookie
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });
        
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);
