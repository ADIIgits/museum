import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
      if (tokens?.refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: tokens.refresh,
          });
          localStorage.setItem(
            'tokens',
            JSON.stringify({ access: data.access, refresh: data.refresh || tokens.refresh })
          );
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
};

// ─── Museums ──────────────────────────────────────────
export const museumsAPI = {
  list: () => api.get('/museums/'),
  myMuseums: () => api.get('/museums/my/'),
  create: (data) => api.post('/museums/', data),
  detail: (id) => api.get(`/museums/${id}/`),
  update: (id, data) => api.patch(`/museums/${id}/`, data),
  delete: (id) => api.delete(`/museums/${id}/`),
};

// ─── Bookings ─────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings/', data),
  list: () => api.get('/bookings/my/'),
  adminList: (params) => api.get('/bookings/admin/all/', { params }),
  detail: (id) => api.get(`/bookings/${id}/`),
  pay: (id) => api.post(`/bookings/${id}/pay/`),
};

export default api;
