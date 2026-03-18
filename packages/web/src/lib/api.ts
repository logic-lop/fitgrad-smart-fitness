import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    apiClient.post('/api/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiClient.get('/api/user/profile'),
  
  updateProfile: (data: {
    name?: string;
    age?: number;
    height?: number;
    weight?: number;
    goal?: string;
  }) => apiClient.put('/api/user/profile', data),
};

// Diet API
export const dietAPI = {
  add: (foodName: string, calories: number, date?: string) =>
    apiClient.post('/api/diet', { foodName, calories, date }),
  
  getAll: () =>
    apiClient.get('/api/diet'),
  
  delete: (id: string) =>
    apiClient.delete(`/api/diet/${id}`),
};

// Workout API
export const workoutAPI = {
  add: (type: string, duration: number, calories: number, date?: string) =>
    apiClient.post('/api/workout', { type, duration, calories, date }),
  
  getAll: () =>
    apiClient.get('/api/workout'),
  
  delete: (id: string) =>
    apiClient.delete(`/api/workout/${id}`),
};

export default apiClient;
