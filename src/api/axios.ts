// src/api/axios.ts
import axios from "axios";
import { getTenantHeader } from "@/utils/tenant";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // trimite cookies la fiecare request
  headers: { "Content-Type": "application/json" },
});

// ——— DOAR X-Tenant; FĂRĂ Authorization
apiClient.interceptors.request.use((config) => {
  const tenant = getTenantHeader();
  if (tenant) (config.headers as any)["X-Tenant"] = tenant;
  return config;
});

let refreshing = false;
let waiters: Array<() => void> = [];

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as any;

    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (refreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        return apiClient(original);
      }

      refreshing = true;
      try {
        // backend VA CITI cookie-ul HttpOnly "refresh_token" și VA SETA un nou "access_token"
        await apiClient.post("/api/v1/auth/refresh");
        waiters.forEach((fn) => fn()); waiters = [];
        return apiClient(original);
      } catch (e) {
        waiters.forEach((fn) => fn()); waiters = [];
        // optional: lovește /auth/logout
        window.location.href = "/login";
        throw e;
      } finally {
        refreshing = false;
      }
    }
    throw error;
  }
);
