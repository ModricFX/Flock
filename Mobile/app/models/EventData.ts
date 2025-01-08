import { SingleDay } from './SingleDay';
import { Participant } from './Participant';
export interface EventData {
    id_event: string;
    name: string;
    description: string;
    location: string;
    end_voting_date: Date;
    id_user: string;
    date_options: SingleDay[];
    participants?: Participant[];
    invitations?: any[];
    eventDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    votes?: Record<string, any>;
}
