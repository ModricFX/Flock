import { TokenStorage } from './TokenStorage';
import { WebTokenStorage } from './WebTokenStorage';
let tokenStorage: TokenStorage;
tokenStorage = new WebTokenStorage();


export { tokenStorage };
