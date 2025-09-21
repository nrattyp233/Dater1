import { User, DatePost, Message } from '../types';
import { premiumVerificationService } from './premiumVerificationService';
import { supabase } from './supabaseClient';

const rawDataApi = (import.meta as any)?.env?.VITE_DATA_API as string | undefined;
const DATA_API = (rawDataApi && rawDataApi.trim()) || '/.netlify/functions/app';

async function call<T>(action: string, payload?: any): Promise<T> {
    const res = await fetch(DATA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

// Fallback read helpers via Supabase (browser) if serverless cannot reach DB
async function tryDirectUsers(): Promise<User[] | null> {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (error) return null;
        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            age: row.age,
            bio: row.bio,
            photos: row.photos ?? [],
            interests: row.interests ?? [],
            gender: row.gender,
            isPremium: row.is_premium,
            preferences: row.preferences ?? null,
            earnedBadgeIds: row.earned_badge_ids ?? [],
        }));
    } catch {
        return null;
    }
}

async function tryDirectDatePosts(): Promise<DatePost[] | null> {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('date_posts').select('*').order('id', { ascending: false });
        if (error) return null;
        return (data || []).map((row: any) => ({
            id: Number(row.id),
            title: row.title,
            description: row.description,
            createdBy: row.created_by,
            location: row.location,
            dateTime: row.date_time,
            applicants: row.applicants ?? [],
            chosenApplicantId: row.chosen_applicant_id,
            categories: row.categories ?? [],
        }));
    } catch {
        return null;
    }
}

async function tryDirectMessages(): Promise<Message[] | null> {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('messages').select('*').order('id', { ascending: true });
        if (error) return null;
        return (data || []).map((row: any) => ({
            id: Number(row.id),
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            text: row.text,
            timestamp: row.timestamp,
            read: row.read,
        }));
    } catch {
        return null;
    }
}

export const getUsers = async (): Promise<User[]> => {
    try {
        return await call<User[]>('getUsers');
    } catch {
        const fallback = await tryDirectUsers();
        if (fallback) return fallback;
        throw new Error('Failed to load users');
    }
};

export const getDatePosts = async (): Promise<DatePost[]> => {
    try {
        return await call<DatePost[]>('getDatePosts');
    } catch {
        const fallback = await tryDirectDatePosts();
        if (fallback) return fallback;
        throw new Error('Failed to load date posts');
    }
};

export const getMessages = async (): Promise<Message[]> => {
    try {
        return await call<Message[]>('getMessages');
    } catch {
        const fallback = await tryDirectMessages();
        if (fallback) return fallback;
        throw new Error('Failed to load messages');
    }
};

export const createDate = (
    newDateData: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId'>,
    currentUserId: number
): Promise<DatePost> => call<DatePost>('createDate', { ...newDateData, createdBy: currentUserId });

export const deleteDate = (id: number): Promise<{ ok: boolean }> => call('deleteDate', { id });
export const chooseApplicant = (dateId: number, applicantId: number): Promise<DatePost> => call('chooseApplicant', { dateId, applicantId });
export const toggleInterest = (dateId: number, userId: number): Promise<DatePost> => call('toggleInterest', { dateId, userId });
export const updateUser = (user: User): Promise<{ ok: boolean }> => call('updateUser', user);
export const sendMessage = (senderId: number, receiverId: number, text: string): Promise<Message> => call('sendMessage', { senderId, receiverId, text });

// Premium verification function
export const verifyPremiumStatus = async (userId: number): Promise<boolean> => {
    try {
        return await premiumVerificationService.verifyUserPremiumStatus(userId);
    } catch (error) {
        console.error('Premium verification failed:', error);
        return false;
    }
};

// Premium-gated API calls
export const requirePremiumForFeature = async (userId: number, featureName: string): Promise<void> => {
    await premiumVerificationService.requirePremium(userId, featureName);
};