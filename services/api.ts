import { User, DatePost, Gender, Message, DateCategory } from '../types';

const USERS: User[] = [
  { 
    id: 1, 
    name: 'Alex', 
    age: 28, 
    bio: 'Software engineer by day, aspiring chef by night. Looking for someone to explore new restaurants with.', 
    photos: [
        'https://picsum.photos/seed/alex1/400/600',
        'https://picsum.photos/seed/alex2/400/600',
        'https://picsum.photos/seed/alex3/400/600',
    ], 
    interests: ['Cooking', 'Tech', 'Hiking'], 
    gender: Gender.Male, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Female], ageRange: { min: 24, max: 32 } },
    earnedBadgeIds: ['starter'],
  },
  { 
    id: 2, 
    name: 'Brenda', 
    age: 25, 
    bio: 'Graphic designer with a love for all things art and nature. My dog is my best friend.', 
    photos: [
        'https://picsum.photos/seed/brenda1/400/600',
        'https://picsum.photos/seed/brenda2/400/600'
    ], 
    interests: ['Art', 'Dogs', 'Photography'], 
    gender: Gender.Female, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Male], ageRange: { min: 25, max: 35 } },
    earnedBadgeIds: ['first_date', 'prolific_planner'],
  },
  { 
    id: 3, 
    name: 'Carlos', 
    age: 31, 
    bio: 'Fitness enthusiast and personal trainer. I believe a healthy body leads to a healthy mind.', 
    photos: [
        'https://picsum.photos/seed/carlos1/400/600',
        'https://picsum.photos/seed/carlos2/400/600',
        'https://picsum.photos/seed/carlos3/400/600',
        'https://picsum.photos/seed/carlos4/400/600'
    ], 
    interests: ['Fitness', 'Nutrition', 'Travel'], 
    gender: Gender.Male, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Female], ageRange: { min: 26, max: 34 } },
    earnedBadgeIds: ['adventurous'],
  },
  { 
    id: 4, 
    name: 'Diana', 
    age: 29, 
    bio: 'Musician and bookworm. Can be found at a local concert or curled up with a good book.', 
    photos: [
        'https://picsum.photos/seed/diana1/400/600',
        'https://picsum.photos/seed/diana2/400/600'
    ], 
    interests: ['Music', 'Reading', 'Coffee'], 
    gender: Gender.Female, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Male, Gender.Female], ageRange: { min: 27, max: 35 } },
    earnedBadgeIds: [],
  },
  { 
    id: 5, 
    name: 'Ethan', 
    age: 27, 
    bio: 'Just a guy who loves to travel and experience new cultures. Where to next?', 
    photos: ['https://picsum.photos/seed/ethan/400/600'], 
    interests: ['Travel', 'Languages', 'History'], 
    gender: Gender.Male, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Female], ageRange: { min: 23, max: 30 } },
    earnedBadgeIds: [],
  },
  { 
    id: 6, 
    name: 'Fiona', 
    age: 26, 
    bio: 'Lover of comedy shows, spicy food, and spontaneous adventures. Let\'s make some memories!', 
    photos: [
        'https://picsum.photos/seed/fiona1/400/600',
        'https://picsum.photos/seed/fiona2/400/600',
        'https://picsum.photos/seed/fiona3/400/600'
    ], 
    interests: ['Comedy', 'Foodie', 'Adventure'], 
    gender: Gender.Female, 
    isPremium: false,
    preferences: { interestedIn: [Gender.Male], ageRange: { min: 25, max: 32 } },
    earnedBadgeIds: [],
  },
];

const DATE_POSTS: DatePost[] = [
  { id: 1, title: 'Stargazing & Picnic', description: 'Let\'s escape the city lights for a bit. I\'ll bring a telescope and some snacks for a relaxing night under the stars. No astronomy knowledge required, just good vibes!', createdBy: 2, location: 'Crestview Park', dateTime: '2024-08-15T20:00', applicants: [3, 5], chosenApplicantId: null, categories: ['Outdoors & Adventure', 'Relaxing & Casual'] },
  { id: 2, title: 'Morning Hike & Coffee', description: 'Join me for a refreshing morning hike on the Sunrise Trail, followed by a well-deserved coffee at The Daily Grind. A great way to start the weekend.', createdBy: 3, location: 'Sunrise Trail', dateTime: '2024-08-17T08:00', applicants: [2, 6], chosenApplicantId: 2, categories: ['Active & Fitness', 'Outdoors & Adventure'] },
  { id: 3, title: 'Indie Band Concert', description: 'The Wandering Echoes are playing downtown! If you\'re into indie rock and live music, this is the spot to be. Let\'s enjoy some great tunes together.', createdBy: 4, location: 'The Velvet Underground', dateTime: '2024-08-16T21:00', applicants: [], chosenApplicantId: null, categories: ['Nightlife', 'Arts & Culture'] },
  { id: 4, title: 'Cooking class', description: 'Let\'s learn to make pasta from scratch.', createdBy: 2, location: 'Downtown', dateTime: '2024-08-20T18:00', applicants: [], chosenApplicantId: null, categories: ['Food & Drink', 'Arts & Culture'] },
  { id: 5, title: 'Art gallery tour', description: 'Explore the latest modern art exhibit.', createdBy: 2, location: 'City Art Museum', dateTime: '2024-08-22T14:00', applicants: [1], chosenApplicantId: null, categories: ['Arts & Culture'] },
];

const MESSAGES: Message[] = [
    { id: 1, senderId: 1, receiverId: 4, text: "Hey Diana! I saw we matched. I love your taste in music. Have you heard of The Wandering Echoes?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
    { id: 2, senderId: 4, receiverId: 1, text: "Hey Alex! I have, they're great! I'm actually going to their concert soon.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), read: true },
    { id: 3, senderId: 1, receiverId: 4, text: "No way! Me too. Maybe I'll see you there.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), read: false },
    { id: 4, senderId: 6, receiverId: 1, text: "Hey, we matched!", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false },
    { id: 5, senderId: 1, receiverId: 2, text: "Hi Brenda!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
    { id: 6, senderId: 1, receiverId: 2, text: "Love your art style.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(), read: true },
    { id: 7, senderId: 1, receiverId: 6, text: "Hey Fiona!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
    { id: 8, senderId: 1, receiverId: 6, text: "What's your favorite comedy club?", timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(), read: false },
];


const MOCK_API_DELAY = 1000; // 1 second delay

// --- READ operations
export const getUsers = (): Promise<User[]> => {
    console.log("API: Fetching users...");
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("API: Responded with users.");
            resolve(JSON.parse(JSON.stringify(USERS))); // Return deep copy
        }, MOCK_API_DELAY);
    });
};

export const getDatePosts = (): Promise<DatePost[]> => {
    console.log("API: Fetching date posts...");
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("API: Responded with date posts.");
            resolve(JSON.parse(JSON.stringify(DATE_POSTS))); // Return deep copy
        }, MOCK_API_DELAY);
    });
};

export const getMessages = (): Promise<Message[]> => {
    console.log("API: Fetching messages...");
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("API: Responded with messages.");
            resolve(JSON.parse(JSON.stringify(MESSAGES)));
        }, MOCK_API_DELAY / 2);
    });
};


// --- WRITE operations (These would be POST/PUT/PATCH requests in a real API)
// In this mock, they just modify the in-memory data and return the new item.

export const createDate = (
    newDateData: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId'>,
    currentUserId: number
): DatePost => {
    const newDate: DatePost = {
        id: Date.now(),
        ...newDateData,
        createdBy: currentUserId,
        applicants: [],
        chosenApplicantId: null,
    };
    // In a real app, this would be a POST request. Here we just prepend to our mock data.
    DATE_POSTS.unshift(newDate);
    return newDate;
};

export const sendMessage = (senderId: number, receiverId: number, text: string): Promise<Message> => {
    console.log("API: Sending message...");
    return new Promise(resolve => {
        setTimeout(() => {
            const newMessage: Message = {
                id: Date.now(),
                senderId,
                receiverId,
                text,
                timestamp: new Date().toISOString(),
                read: false,
            };
            MESSAGES.push(newMessage);
            console.log("API: Message sent.");
            resolve(JSON.parse(JSON.stringify(newMessage)));
        }, 300);
    });
};