import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3008/api/v1",
  withCredentials: true, // critical for reading/writing httpOnly session refresh cookies
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Automatically inject Bearer Authorization token if present in localStorage
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

export default api;
