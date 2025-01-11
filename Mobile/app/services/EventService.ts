// services/EventService.ts
import { AxiosInstance } from 'axios';
import { EventData } from '../models/EventData';
import { Vote } from '../models/Vote';

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

    async getMyEvents(id: string): Promise<{ success:boolean, data?: EventData[], error?: any }> {
       const response = await this.api.get('/event/user/'+id);

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

    async deleteEvent(id_event: number, id_user: number): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await this.api.delete('/event', {
                params: {
                    user_id: id_user // Query parameter
                },
                data: {
                    id_user: id_user, // Request body
                    id_event: id_event
                }
            });

            if (response.status === 200) {
                return { success: true };
            } else {
                return { success: false, error: `Failed with status: ${response.status}` };
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Error deleting event:', error);
            return { success: false, error: errorMessage };
        }
    }

    async castVote(vote: Vote): Promise<{ success:boolean, data?: any, error?: string }>  {
        const response = await this.api.post('/event/vote/cast', vote);
        if(!response || response.status != 200){
            return { success: false, error: "error creating vote" }
        }
        return { success: true, data: response.data };
    }

    async deleteVote(vote: Vote): Promise<{ success:boolean, data?: any, error?: string }>  {
        const response = await this.api.post('/event/vote/delete', vote);
        if(!response || response.status != 200){
            return { success: false, error: "error deleting vote" }
        }
        return { success: true, data: response.data };
    }
}
