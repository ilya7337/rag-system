import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = '/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    // backend sets JWT in HttpOnly cookie; browser must send it back
    withCredentials: true,
});


apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Backend uses HttpOnly cookie, so we don't read/attach Authorization header from localStorage.
    return config;
});


apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default apiClient;