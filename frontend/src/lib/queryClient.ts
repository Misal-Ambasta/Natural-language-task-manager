import { QueryClient } from "@tanstack/react-query";
import type { QueryFunction } from "@tanstack/react-query";
import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Handle response errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      throw new Error(`${error.response.status}: ${error.response.data || error.response.statusText}`);
    }
    throw error;
  }
);

// Export axios instance
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const response = await axiosInstance({
    method,
    url,
    data
  });
  
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await axiosInstance.get(queryKey[0] as string);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
