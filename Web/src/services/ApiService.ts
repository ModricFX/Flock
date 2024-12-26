import axios, { AxiosInstance } from 'axios';
import { tokenStorage } from '../storage';
import config from '../config';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: config.apiBaseUrl,
        });

        // Intercept requests to add token
        this.api.interceptors.request.use(async (config) => {
            const token = await tokenStorage.getToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        });
    }

    getApi(): AxiosInstance {
        return this.api;
    }
}

// Export a singleton instance
export const apiService = new ApiService();
