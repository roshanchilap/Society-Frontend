import axios from "axios";
import { useAuthStore } from "../auth/useAuthStore";

let restoringFlag = false;

export function setRestoring(value) {
  restoringFlag = value;
}

export function isRestoring() {
  return restoringFlag;
}

function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 401) {
    return "Your session has expired. Please login again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to do this action.";
  }

  if (error.response?.status === 404) {
    return "Requested data was not found.";
  }

  if (error.message === "Network Error") {
    return "Unable to connect to server. Please try again.";
  }
  if (error.response?.status === 500) {
    return "Request failed with status code 500";
  }

  return "Something went wrong. Please try again later.";
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL1,
  // baseURL: "http://localhost:5000/api",
});

// Attach token automatically before each request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response error handler
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    error.userMessage = getErrorMessage(error);

    // keep your existing logout logic
    if (
      error.response?.status === 401 &&
      !isRestoring() &&
      !error.config?.url?.includes("/auth/me")
    ) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
