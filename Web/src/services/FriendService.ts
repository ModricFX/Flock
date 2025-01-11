import { AxiosInstance } from 'axios';

export class FriendService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getFriends(id_user: string, status: string) {
        const response = await this.api.get(`/user/relationship/${id_user}/${status}`);
        return response.data;
    }

    async getFriendData(id_user: string) {
        const response = await this.api.get(`/user/${id_user}`);
        return response.data;
    }

    async updateRelationshipStatus(related_user_id: number, status: string) {
        const response = await this.api.post(`/user/relationship`, { related_user_id, status });
        return response;
    }

    async sendFriendRequest(text: string) : Promise<{ success: boolean; data?: any; error?: string }>{
        const response = await this.api.post(`/user/relationship/${text}`);

        if(!response){
            return { success: false, error: 'Failed to send friend request' };
        }
        if(response.request._response && response.request._response == 'already exists'){
            return { success: false, error: 'Relationship already exists' };
        }
        if(response.status !== 200){
            return { success: false, error: 'User not found' };
        }
        return { success: true, data: response.data};
    }
}
