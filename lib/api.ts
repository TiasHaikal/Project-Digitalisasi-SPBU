import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "https://744747560e62.ngrok-free.app/api/v1",
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

export default API;
