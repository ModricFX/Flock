// types.ts
export interface Event {
    title: string;
    startDate: string;
    startTime?: string; // Optional
    endDate?: string;   // Optional
    endTime?: string;   // Optional
    description?: string; // Optional
    location: string;
    participants?: number; // Optional
  }
  

export interface AppNotification {
    sender: string;
    message: string;
    time: string;
}
