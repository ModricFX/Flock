export interface Participant {
    id: string;
    username: string;
    email: string;
    pfpUrl: string;
    status: 'pending' | 'accepted' | 'declined';
}