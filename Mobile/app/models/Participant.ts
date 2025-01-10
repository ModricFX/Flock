export interface Participant {
    id: string;
    username: string;
    email: string;
    pfp_url: string;
    status: 'pending' | 'accepted' | 'declined';
}