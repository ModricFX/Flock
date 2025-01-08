// services/EventService.ts
import { AxiosInstance } from 'axios';
import { EventData } from '../models/EventData';

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

    async getEvents(): Promise<{ data: EventData[] }> {
       const response = await this.api.get('/event');
       return response;
    }

    async getEventById(id: string) {
        const response = await this.api.get('/event/'+id+'');
        return response.data;
    }

    async createEvent(event: any) {
        const response = await this.api.post('/event', event);
        return response.data;
    }
}
