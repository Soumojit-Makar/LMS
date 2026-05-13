import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      if (isRefreshing) return new Promise((res) => { queue.push((t) => { orig.headers.Authorization = `Bearer ${t}`; res(api(orig)); }); });
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, {}, { withCredentials: true });
        useAuthStore.getState().setToken(data.accessToken);
        queue.forEach((cb) => cb(data.accessToken)); queue = [];
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch { useAuthStore.getState().clearAuth(); window.location.href = '/login'; return Promise.reject(err); }
      finally { isRefreshing = false; }
    }
    return Promise.reject(err);
  }
);
export default api;