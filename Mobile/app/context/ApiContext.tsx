// context/ApiContext.tsx
import React, { createContext, useContext } from 'react';
import { ApiService } from '../services/ApiService';
import { WebTokenStorage } from '../storage/WebTokenStorage';
import { NativeTokenStorage } from '../storage/NativeTokenStorage';
import { Platform } from 'react-native'; // To determine the platform

// Define the shape of the context
interface ApiContextProps {
    apiService: ApiService;
}

// Create the context
const ApiContext = createContext<ApiContextProps | undefined>(undefined);

// Create a provider component
// @ts-ignore
export const ApiProvider: React.FC = ({ children }) => {
    // Determine the platform to choose the correct TokenStorage
    const isWeb = Platform.OS === 'web';
    const tokenStorage = isWeb ? new WebTokenStorage() : new NativeTokenStorage();

    // Initialize ApiService with the selected TokenStorage
    const apiService = new ApiService(tokenStorage);

    return <ApiContext.Provider value={{ apiService }}>{children}</ApiContext.Provider>;
};

// Create a custom hook to use the ApiService
export const useApi = (): ApiService => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context.apiService;
};