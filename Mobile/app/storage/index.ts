import { Platform } from 'react-native';
import { TokenStorage } from './TokenStorage';
import { WebTokenStorage } from './WebTokenStorage';
import { SecureTokenStorage } from './SecureTokenStorage';

let tokenStorage: TokenStorage;

if (Platform.OS === 'web') {
    tokenStorage = new WebTokenStorage();
} else {
    // On iOS/Android, use secure storage
    tokenStorage = new SecureTokenStorage();
}

export { tokenStorage };
