import axios from 'axios';
import { insforge } from './insforge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token if possible
api.interceptors.request.use(
  async (config) => {
    try {
      // Assuming insforge.auth.getSession() returns a session containing the access_token
      const sessionResult = await (insforge.auth as any).getSession?.();
      const token = sessionResult?.data?.session?.access_token || sessionResult?.access_token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore errors fetching session
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
