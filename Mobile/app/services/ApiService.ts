// services/ApiService.ts
import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

import { AuthService } from './authservice';
import { TokenStorage } from '../storage/TokenStorage';

// Placeholder imports for other services
// import { EventService } from './EventService';
// import { FriendService } from './FriendService';

interface AppConfig {
    apiEndpoint: string;
}

export class ApiService {
    private api: AxiosInstance;
    private tokenStorage: TokenStorage;
    public authService: AuthService;
    // public eventService: EventService;
    // public friendService: FriendService;

    constructor(tokenStorage: TokenStorage) {
        const appConfig = Constants.manifest?.extra as AppConfig;

        if (!appConfig?.apiEndpoint) {
            throw new Error('Missing API endpoint configuration');
        }

        this.api = axios.create({
            baseURL: appConfig.apiEndpoint,
        });

        this.tokenStorage = tokenStorage;

        // Set up request interceptor to include the token
        this.api.interceptors.request.use(async (config) => {
            const token = await this.tokenStorage.getToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        });

        // Initialize services
        this.authService = new AuthService(this.api, this.tokenStorage);
        // this.eventService = new EventService(this.api);
        // this.friendService = new FriendService(this.api);
    }
}
