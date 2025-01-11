import { SingleDay } from './SingleDay';
import { Participant } from './Participant';
import { Vote } from './Vote';

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
    chosen_date_start?: Date;
    chosen_date_end?: Date;
    date_created: Date;
    date_updated: Date;
    votes?: Vote[];
}
