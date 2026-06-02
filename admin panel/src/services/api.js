import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://application.shayonaglass.com/api",
  withCredentials: true
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;