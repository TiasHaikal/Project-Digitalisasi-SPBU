import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "https://12799eac3db9.ngrok-free.app/api/v1",
});

// Interceptor untuk nambahin JWT ke header
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("token"); // ⬅️ ambil dari cookies
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper untuk foto URL
 * - Kalau full URL (http/https) → pakai langsung
 * - Kalau relative path → gabung dengan baseURL backend (tanpa `/api/v1`)
 */
export const getPhotoUrl = (path?: string) => {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  // baseURL sekarang "https://.../api/v1"
  // kita ambil hanya domain utamanya, biar /uploads bisa diakses
  const base = API.defaults.baseURL?.replace("/api/v1", "") || "";
  return `${base}${path}`;
};

export default API;
