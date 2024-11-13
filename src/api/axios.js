import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 403 || error.response.status === 401) {
        // Lưu current URL và email trước khi redirect
        localStorage.setItem('lastPath', window.location.pathname);
        localStorage.setItem('lastEmail', localStorage.getItem('userEmail'));
        console.log("1111");
        toast.warning("Session expired! Please login again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }, 5000);
      } 
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
