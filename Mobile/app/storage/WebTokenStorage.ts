// storage/WebTokenStorage.ts
import { TokenStorage } from './TokenStorage';

export class WebTokenStorage implements TokenStorage {
    async getToken() {
        return localStorage.getItem('token');
    }

    async setToken(token: string) {
        localStorage.setItem('token', token);
    }

    async removeToken() {
        localStorage.removeItem('token');
    }
}
