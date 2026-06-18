import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Configured Axios instance — single source of truth for all API calls.
 * SRP: This module exclusively handles API communication.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  imageUrl: string;
  contactDetails?: string;
  rating?: number;
  reviewsCount?: number;
  vibes: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Fetches all properties */
export const getAllProperties = async (): Promise<Property[]> => {
  const { data } = await apiClient.get<Property[]>('/api/properties');
  return data;
};

/** Searches properties by location */
export const searchByLocation = async (location: string): Promise<Property[]> => {
  const { data } = await apiClient.get<Property[]>('/api/properties/search', {
    params: { location },
  });
  return data;
};

/**
 * AI-powered vibe search — sends natural language prompt to backend,
 * which forwards to Gemini and returns filtered results.
 */
export const searchByVibe = async (prompt: string): Promise<Property[]> => {
  const { data } = await apiClient.get<Property[]>('/api/ai/search', {
    params: { prompt },
  });
  return data;
};

// ─── User & History API Functions ────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  consent: boolean;
}

export interface SearchHistory {
  id: number;
  userId: number;
  query: string;
  timestamp: string;
}

export const registerUser = async (user: any): Promise<User> => {
  const { data } = await apiClient.post<User>('/api/users/register', user);
  return data;
};

export const loginUser = async (user: any): Promise<User> => {
  const { data } = await apiClient.post<User>('/api/users/login', user);
  return data;
};

export const updateUserConsent = async (userId: number, consent: boolean): Promise<User> => {
  const { data } = await apiClient.post<User>('/api/users/consent', { userId, consent });
  return data;
};

export const getUserHistory = async (userId: number): Promise<SearchHistory[]> => {
  const { data } = await apiClient.get<SearchHistory[]>(`/api/users/${userId}/history`);
  return data;
};

export const addUserHistory = async (userId: number, query: string): Promise<any> => {
  const { data } = await apiClient.post('/api/users/history/add', { userId, query });
  return data;
};

export const getSuggestions = async (userId?: number): Promise<Property[]> => {
  const { data } = await apiClient.get<Property[]>('/api/properties/suggestions', {
    params: userId ? { userId } : {},
  });
  return data;
};
