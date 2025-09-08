import axiosInstance from "./axiosInstance";

const apiService = {
  get: (url, params = {}) => {
    return axiosInstance.get(url, { params });
  },

  post: (url, data = {}) => {
    return axiosInstance.post(url, data);
  },

  put: (url, data = {}) => {
    return axiosInstance.put(url, data);
  },

  delete: (url) => {
    return axiosInstance.delete(url);
  },
};

export default apiService;
