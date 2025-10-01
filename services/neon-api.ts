import { User, DatePost, Message } from '../types';

const callApi = async (action: string, payload?: any) => {
  try {
    const response = await fetch('/.netlify/functions/data-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API call failed for action: ${action}`, error);
    throw error;
  }
};

// --- User Functions ---
export const getUsers = async (): Promise<User[]> => callApi('getUsers');
export const getUser = async (id: string): Promise<User> => callApi('getUser', { id });
export const createUser = async (user: Partial<User>): Promise<User> => callApi('createUser', { user });
export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => callApi('updateUser', { id, updates });
export const deleteUser = async (id: string): Promise<void> => callApi('deleteUser', { id });

// --- DatePost Functions ---
export const getDatePosts = async (): Promise<DatePost[]> => callApi('getDatePosts');
export const getDatePost = async (id: string): Promise<DatePost> => callApi('getDatePost', { id });
export const createDatePost = async (post: Omit<DatePost, 'id'>): Promise<DatePost> => callApi('createDatePost', { post });
export const updateDatePost = async (id: string, updates: Partial<DatePost>): Promise<DatePost> => callApi('updateDatePost', { id, updates });
export const deleteDatePost = async (id: string): Promise<void> => callApi('deleteDatePost', { id });

// --- Message Functions ---
export const getMessages = async (): Promise<Message[]> => callApi('getMessages');
export const createMessage = async (message: Omit<Message, 'id'>): Promise<Message> => callApi('createMessage', { message });

// --- Interaction Functions ---
export const toggleInterest = async (dateId: string, userId: string): Promise<DatePost> => {
  const datePost = await getDatePost(dateId);
  if (!datePost) throw new Error('Date post not found');

  const applicants = [...(datePost.applicants || [])];
  const index = applicants.indexOf(userId);

  if (index === -1) {
    applicants.push(userId);
  } else {
    applicants.splice(index, 1);
  }

  return updateDatePost(dateId, { applicants });
};

export const chooseApplicant = async (dateId: string, applicantId: string): Promise<DatePost> => {
  return updateDatePost(dateId, { chosenApplicantId: applicantId });
};
