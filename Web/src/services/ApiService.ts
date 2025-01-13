import axios, { AxiosInstance } from 'axios';
import config from '../config'; // Import the config file
import { tokenStorage } from '../storage'; // Use the centralized tokenStorage

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: config.apiBaseUrl, // Use the URL from config
        });

        // Intercept requests to add token
        this.api.interceptors.request.use(async (config) => {
            const token = await tokenStorage.getToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => error.response
        );
    }

    get(endpoint: string, config?: object) {
        return this.api.get(endpoint, config);
    }

    post(endpoint: string, data: object, config?: object) {
        return this.api.post(endpoint, data, config);
    }

    put(endpoint: string, data: object, config?: object) {
        return this.api.put(endpoint, data, config);
    }

    delete(endpoint: string, config?: object) {
        return this.api.delete(endpoint, config);
    }

    getApi(): AxiosInstance {
        return this.api;
    }
}

// Export a singleton instance
export const apiService = new ApiService();
