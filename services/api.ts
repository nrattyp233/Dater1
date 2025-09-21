import { User, DatePost, Message } from '../types';
import { premiumVerificationService } from './premiumVerificationService';

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

export const getUsers = (): Promise<User[]> => call<User[]>('getUsers');
export const getDatePosts = (): Promise<DatePost[]> => call<DatePost[]>('getDatePosts');
export const getMessages = (): Promise<Message[]> => call<Message[]>('getMessages');

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