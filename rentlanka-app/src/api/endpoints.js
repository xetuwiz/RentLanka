import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor – refresh token on 401
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = res.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    refresh: (data) => api.post('/auth/refresh', data),
    logout: (data) => api.post('/auth/logout', data)
};

export const spatialApi = {
    getProvinces: () => api.get('/spatial/provinces'),
    getChildren: (id) => api.get(`/spatial/${id}/children`),
    search: (q) => api.get('/spatial/search', { params: { q } })
};

export const vehiclesApi = {
    getAll: () => api.get('/vehicles'),
    getById: (id) => api.get(`/vehicles/${id}`),
    search: (params) => api.get('/vehicles/search', { params }),
    nearby: (lat, lng, radius) => api.get('/vehicles/nearby', { params: { lat, lng, radius } }),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status })
};

export const bookingsApi = {
    create: (data) => api.post('/bookings', data),
    getMy: () => api.get('/bookings/my'),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`)
};

export const ownerApi = {
    getVehicles: () => api.get('/owner/vehicles'),
    getBookings: () => api.get('/owner/bookings'),
    acceptBooking: (id) => api.patch(`/owner/bookings/${id}/accept`),
    rejectBooking: (id) => api.patch(`/owner/bookings/${id}/reject`)
};

export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: () => api.get('/admin/users'),
    toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
    getVehicles: () => api.get('/admin/vehicles'),
    getBookings: () => api.get('/admin/bookings')
};
