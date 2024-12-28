import { apiService } from './ApiService';
import { tokenStorage } from '../storage';
import { JwtPayload, jwtDecode } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
    // You can add extra fields if your token has them
    // e.g. role?: string;
}

class AuthService {
    // No need to pass storage or api; we have singletons

    async register(data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
    }) {
        const response = await apiService.getApi().post('/user', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ``
            },
        });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await apiService.getApi().post('/auth/token', { Email: email, Password: password });
        const token = response.data.token;
        await tokenStorage.setToken(token);
        return response.data;
    }

    async logout() {
        await tokenStorage.removeToken();
    }

    /**
     * Checks for an existing token and tries to renew it if still valid.
     * If successful, returns { success: true, data: userData }.
     * Otherwise, returns { success: false, error: '...' }.
     */
    async getUserData(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // 1. Check if we have a token at all
            const token = await tokenStorage.getToken();
            if (!token) {
                return { success: false, error: 'No token found. Please log in again.' };
            }

            // 2. Decode the token to see if it's still valid
            const decoded = jwtDecode<DecodedToken>(token);
            const nowInSeconds = Math.floor(Date.now() / 1000);

            if (!decoded.exp || decoded.exp < nowInSeconds) {
                // Token is expired (or missing exp), must log in again
                return { success: false, error: 'Token expired. Please log in again.' };
            }

            // 3. Token is still valid -> try to renew
            const renewResponse = await apiService.getApi().post('/auth/token/renew', { oldToken: token });
            const newToken = renewResponse.data.token;
            await tokenStorage.setToken(newToken);

            // 4. With the fresh token, get the user data
            const userResponse = await apiService.getApi().get('/user/me', {
                headers: {
                    Authorization: newToken
                },
            });

            return { success: true, data: userResponse.data };
        } catch (error: any) {
            // If anything fails (renewal, user fetch, etc.), 
            // assume the user needs to log in again
            return { success: false, error: error.message || 'Failed to renew token.' };
        }
    }
}

export const authService = new AuthService();
