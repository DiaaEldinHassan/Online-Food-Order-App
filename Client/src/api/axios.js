import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = localStorage.getItem("lang") || "en";
  return config;
});

export default api;
