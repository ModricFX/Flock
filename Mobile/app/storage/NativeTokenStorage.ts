// storage/NativeTokenStorage.ts
import { TokenStorage } from './TokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NativeTokenStorage implements TokenStorage {
    async getToken() {
        return await AsyncStorage.getItem('token');
    }

    async setToken(token: string) {
        await AsyncStorage.setItem('token', token);
    }

    async removeToken() {
        await AsyncStorage.removeItem('token');
    }
}
