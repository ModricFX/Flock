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

    async getEvents(): Promise<{ success:boolean, data?: EventData[], error?: any }> {
       const response = await this.api.get('/event');

       if(!response){
        return { success: false, error: "no response from server" }
       }
       if(response.status != 200){
        return { success: false, error: response}
       }

       
       return { success: true, data: response.data };
    }

    async getEventById(id: string): Promise<{ success:boolean, data?: EventData, error?: string }> {
        const response = await this.api.get('/event/'+id+'');
        if(!response || response.status != 200){
            return { success: false, error: "error fetching event" }
        }
        return { success: true, data: response.data };
    }

    async createEvent(event: any): Promise<{ success:boolean, data?: EventData, error?: string }>  {
        const response = await this.api.post('/event', event);
        if(!response || response.status != 200){
            return { success: false, error: "error creating event" }
        }
        return { success: true, data: response.data };
    }

    async updateEvent(event: any): Promise<{ success:boolean, data?: EventData, error?: string }> {
        const response = await this.api.put('/event', event);
        if(!response){
            return { success: false, error: "error updating event" }
        }
        if(response.status != 200){
            return { success: false, error: response.status.toString() }
        }
        return { success: true, data: response.data };
    }
}
