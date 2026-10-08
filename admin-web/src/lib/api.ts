import axios from "axios";
import { TOKEN_KEY, clearSession } from "./storage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (typeof window !== "undefined" && error?.response?.status === 401) {
    clearSession();
    window.location.assign("/login");
  }
  return Promise.reject(error);
});
