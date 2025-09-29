import { User, DatePost, Message } from '../types';

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;

const BINS = {
  USERS: import.meta.env.VITE_USERS_BIN_ID,
  DATES: import.meta.env.VITE_DATES_BIN_ID,
  MESSAGES: import.meta.env.VITE_MESSAGES_BIN_ID,
  PAYMENTS: import.meta.env.VITE_PAYMENTS_BIN_ID
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

async function callJsonBin<T>(binId: string, method: 'GET' | 'PUT' | 'POST' = 'GET', body?: any): Promise<T> {
  try {
    const url = `${JSONBIN_API_URL}/${binId}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Master-Key': MASTER_KEY,
      'X-Bin-Meta': 'false'
    };

    const response = await fetch(url, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    const data = await response.json();
    return method === 'GET' ? data : data.record;
  } catch (error) {
    console.error('JSONBin API call failed:', error);
    throw error;
  }
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const data = await callJsonBin<{ users: User[] }>(BINS.USERS);
    return data.users || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const currentUsers = await getUsers();
  const newUser: User = { ...user, id: generateId() };
  await callJsonBin(BINS.USERS, 'PUT', { users: [...currentUsers, newUser] });
  return newUser;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) throw new Error('User not found');
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  await callJsonBin(BINS.USERS, 'PUT', { users });
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
  const users = await getUsers();
  await callJsonBin(BINS.USERS, 'PUT', { users: users.filter(u => u.id !== id) });
};

export const getDatePosts = async (): Promise<DatePost[]> => {
  try {
    const data = await callJsonBin<{ dates: DatePost[] }>(BINS.DATES);
    return data.dates || [];
  } catch (error) {
    console.error('Failed to fetch date posts:', error);
    return [];
  }
};

export const createDatePost = async (post: Omit<DatePost, 'id'>): Promise<DatePost> => {
  const currentDates = await getDatePosts();
  const newDatePost: DatePost = { ...post, id: generateId() };
  await callJsonBin(BINS.DATES, 'PUT', { dates: [...currentDates, newDatePost] });
  return newDatePost;
};

export const updateDatePost = async (id: string, updates: Partial<DatePost>): Promise<DatePost> => {
  const dates = await getDatePosts();
  const dateIndex = dates.findIndex(d => d.id === id);
  if (dateIndex === -1) throw new Error('Date post not found');
  
  const updatedDate = { ...dates[dateIndex], ...updates };
  dates[dateIndex] = updatedDate;
  await callJsonBin(BINS.DATES, 'PUT', { dates });
  return updatedDate;
};

export const deleteDatePost = async (id: string): Promise<void> => {
  const dates = await getDatePosts();
  await callJsonBin(BINS.DATES, 'PUT', { dates: dates.filter(d => d.id !== id) });
};

export const getMessages = async (): Promise<Message[]> => {
  try {
    const data = await callJsonBin<{ messages: Message[] }>(BINS.MESSAGES);
    return data.messages || [];
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
};

export const createMessage = async (message: Omit<Message, 'id'>): Promise<Message> => {
  const currentMessages = await getMessages();
  const newMessage: Message = { ...message, id: generateId() };
  await callJsonBin(BINS.MESSAGES, 'PUT', { messages: [...currentMessages, newMessage] });
  return newMessage;
};

export const updateMessage = async (id: string, updates: Partial<Message>): Promise<Message> => {
  const messages = await getMessages();
  const messageIndex = messages.findIndex(m => m.id === id);
  if (messageIndex === -1) throw new Error('Message not found');
  
  const updatedMessage = { ...messages[messageIndex], ...updates };
  messages[messageIndex] = updatedMessage;
  await callJsonBin(BINS.MESSAGES, 'PUT', { messages });
  return updatedMessage;
};

export const deleteMessage = async (id: string): Promise<void> => {
  const messages = await getMessages();
  await callJsonBin(BINS.MESSAGES, 'PUT', { messages: messages.filter(m => m.id !== id) });
};

export const toggleInterest = async (dateId: string, userId: string): Promise<DatePost> => {
  const datePost = (await getDatePosts()).find(d => d.id === dateId);
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
