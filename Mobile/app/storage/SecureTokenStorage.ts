import { TokenStorage } from './TokenStorage';
import * as SecureStore from 'expo-secure-store';

export class SecureTokenStorage implements TokenStorage {
    async getToken() {
        return await SecureStore.getItemAsync('token');
    }

    async setToken(token: string) {
        await SecureStore.setItemAsync('token', token);
    }

    async removeToken() {
        await SecureStore.deleteItemAsync('token');
    }
}
