export interface Participant {
    username: string;
    email: string;
    pfpUrl: string;
    status: 'pending' | 'accepted' | 'declined';
}