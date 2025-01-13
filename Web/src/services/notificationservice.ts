// NotificationService.ts

import { apiService } from './ApiService';
import { tokenStorage } from '../storage';
import { JwtPayload, jwtDecode } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
    // Add any additional fields from your JWT if necessary
}

interface Notification {
    id_User: number;
    id_Notification: number;
    unread: boolean;
    date_Received: string;
    notification: {
        id_Notification: number;
        title: string;
        description: string;
    };
}

class NotificationService {
    /**
     * Fetches the list of notifications for the authenticated user.
     * @returns An array of notifications.
     */
    async getNotifications(): Promise<Notification[]> {
        try {
            const token = await this.checkAndRenewToken();
            const response = await apiService.getApi().get('/notification/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            return response.data;
        } catch (error: any) {
            // Handle different error scenarios as needed
            throw new Error(error.message || 'Failed to fetch notifications.');
        }
    }

    /**
     * Marks a specific notification as read.
     * @param notificationId The ID of the notification to mark as read.
     */
    async markAsRead(notificationId: number): Promise<void> {
        try {
            const token = await this.checkAndRenewToken();
            await apiService.getApi().post(`/notification/markAsRead/${notificationId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to mark notification as read.');
        }
    }

    /**
     * Checks the current token and renews it if necessary.
     * @returns The valid token.
     */
    private async checkAndRenewToken(): Promise<string> {
        const token = await tokenStorage.getToken();
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (!decoded.exp || decoded.exp < nowInSeconds) {
            // Token is expired, attempt to renew
            try {
                const renewResponse = await apiService.getApi().post('/auth/token/renew', { oldToken: token });
                const newToken = renewResponse.data.token;
                await tokenStorage.setToken(newToken);
                return newToken;
            } catch (renewError: any) {
                throw new Error(renewError.message || 'Failed to renew token. Please log in again.');
            }
        }

        return token;
    }
}

export const notificationService = new NotificationService();
