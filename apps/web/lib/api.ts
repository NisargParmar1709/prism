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

// Remove manual interceptor because the Next.js proxy (/api/proxy) handles the token extraction from the secure cookie
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
