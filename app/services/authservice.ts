// services/AuthService.ts
import { AxiosInstance } from 'axios';
import { TokenStorage } from '../storage/TokenStorage';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

export class AuthService {
    private api: AxiosInstance;
    private tokenStorage: TokenStorage;
    private tokenRefreshThreshold = 60; // seconds

    constructor(api: AxiosInstance, tokenStorage: TokenStorage) {
        this.api = api;
        this.tokenStorage = tokenStorage;
    }

    async register(data: { First_name: string; Last_name: string; Email: string; Password: string }) {
        const response = await this.api.post('/auth/register', data);
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.api.post('/auth/login', { Email: email, Password: password });
        const { Token } = response.data;
        await this.tokenStorage.setToken(Token);
        return response.data;
    }

    async logout() {
        await this.tokenStorage.removeToken();
    }

    async getUserData() {
        const response = await this.api.get('/user/profile');
        return response.data;
    }

    // ... Include token renewal logic if applicable
}
