import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Configured Axios instance — single source of truth for all API calls.
 * SRP: This module exclusively handles API communication.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
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
