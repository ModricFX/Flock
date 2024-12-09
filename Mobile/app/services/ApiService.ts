import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { tokenStorage } from '../storage'; // Use the centralized tokenStorage

interface AppConfig {
    apiEndpoint: string;
}

class ApiService {
    private api: AxiosInstance;

    constructor() {
        const appConfig = Constants.manifest?.extra as AppConfig;

        if (!appConfig?.apiEndpoint) {
            throw new Error('Missing API endpoint configuration');
        }

        this.api = axios.create({
            baseURL: appConfig.apiEndpoint,
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
