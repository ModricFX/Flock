// services/EventService.ts
import { AxiosInstance } from 'axios';

export class EventService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    // Example method to get events
    // async getEvents() {
    //   const response = await this.api.get('/events');
    //   return response.data;
    // }

    // Add methods for event-related operations
}
