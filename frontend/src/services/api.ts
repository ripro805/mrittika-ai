import axios from "axios";

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For httpOnly refresh cookie
});

// Access token in memory
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request interceptor to attach JWT
apiClient.interceptors.request.use((config) => {
  const isAuthPublicEndpoint =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/refresh");

  if (accessToken && config.headers && !isAuthPublicEndpoint) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (isAuthPublicEndpoint && config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

// Response interceptor to auto-refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        if (res.data?.access) {
          setAccessToken(res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
