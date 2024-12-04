// storage/TokenStorage.ts
export interface TokenStorage {
    getToken(): Promise<string | null>;
    setToken(token: string): Promise<void>;
    removeToken(): Promise<void>;
}
