// services/FriendService.ts
import { AxiosInstance } from 'axios';

export class FriendService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    // Example method to get friend list
    // async getFriends() {
    //   const response = await this.api.get('/friends');
    //   return response.data;
    // }

    // Add methods for friend-related operations

    async getFriends(id_user: string, status: string) {
        const response = await this.api.get(`/user/relationship/${id_user}/${status}`);
        return response.data;
    }

    async getFriendData(id_user: string) {
        const response = await this.api.get(`/user/${id_user}`);
        return response.data;
    }
}
