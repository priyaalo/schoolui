import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://alosodt.com/api",
});

axiosInstance.interceptors.request.use((config) => {
const token = localStorage.getItem("authToken");
const userId = localStorage.getItem("userId");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    config.headers.userid = userId;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
