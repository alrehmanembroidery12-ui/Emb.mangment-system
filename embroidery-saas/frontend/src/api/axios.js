import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'https://embroidery-backend-nine.vercel.app';

const instance = axios.create({
  baseURL: apiURL,
});

// Add a request interceptor to include JWT token in all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
