import { apiService } from './ApiService';
import { tokenStorage } from '../storage';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

class AuthService {
    private tokenRefreshThreshold = 60; // seconds

    // No need to pass storage or api; we have singletons
    async register(data: { first_name: string; last_name: string; email: string; password: string }) {
        const response = await apiService.getApi().post('/Auth/Register', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ``
            },
        });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await apiService.getApi().post('/Auth/Login', { Email: email, Password: password });
        console.log(response, response.data, response.data.token);
        const token = response.data.token;
        await tokenStorage.setToken(token);
        console.log('Token:', token);
        console.log( tokenStorage.getToken());
        return response.data;
    }

    async logout() {
        await tokenStorage.removeToken();
    }

    async getUserData() {
        const token = await tokenStorage.getToken();
        const response = await apiService.getApi().get('/User/Profile', {
            headers: {
                'Authorization': `${token}`
            }
        });
        return response.data;
    }
}

export const authService = new AuthService();
