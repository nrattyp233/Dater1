import { User, DatePost, Message, Gender, LocalEvent, Business, Deal } from '../types';
import { getRealtimeEvents } from './geminiService';

// --- MOCK DATA ---
let users: User[] = [
    {
        id: 1,
        name: 'Alex',
        age: 28,
        bio: 'Software engineer by day, aspiring chef by night. Looking for someone to explore new restaurants with, or stay in and cook a great meal together. Love hiking, indie music, and a good sci-fi movie.',
        photos: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ],
        interests: ['Cooking', 'Hiking', 'Sci-Fi', 'Indie Music'],
        gender: Gender.Male,
        isPremium: true,
        isVerified: true,
        preferences: {
            interestedIn: [Gender.Female],
            ageRange: { min: 24, max: 32 },
            relationshipIntent: 'Serious',
            communicationStyle: 'Texting',
            activityLevel: 'Bit of both',
        },
        earnedBadgeIds: ['first_date', 'prolific_planner'],
    },
    {
        id: 2,
        name: 'Brenda',
        age: 26,
        bio: 'Graphic designer with a love for all things vintage. I spend my weekends thrift shopping and trying to keep my houseplants alive. Let\'s grab coffee and talk about our favorite films.',
        photos: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ],
        interests: ['Art', 'Vintage', 'Plants', 'Movies', 'Coffee'],
        gender: Gender.Female,
        isPremium: false,
        isVerified: false,
        preferences: {
            interestedIn: [Gender.Male],
            ageRange: { min: 25, max: 35 },
            relationshipIntent: 'Exploring',
            communicationStyle: 'Texting',
            activityLevel: 'Relaxed',
        },
        earnedBadgeIds: ['starter'],
    },
    {
        id: 3,
        name: 'Carlos',
        age: 30,
        bio: 'Fitness enthusiast and dog lover. You can find me at the gym or the dog park. Looking for a workout partner and someone who doesn\'t mind a bit of dog hair.',
        photos: ['https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        interests: ['Fitness', 'Dogs', 'Outdoors', 'Healthy Eating'],
        gender: Gender.Male,
        isPremium: false,
        isVerified: true,
        preferences: {
            interestedIn: [Gender.Female],
            ageRange: { min: 26, max: 34 },
            relationshipIntent: 'Casual',
            communicationStyle: 'In-person',
            activityLevel: 'Active',
        },
    },
    {
        id: 4,
        name: 'Diana',
        age: 29,
        bio: 'Travel bug and bookworm. My goal is to visit every continent. I love a good story, whether it\'s in a book or from a person. Tell me about your last adventure.',
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        interests: ['Travel', 'Reading', 'Photography', 'Culture'],
        gender: Gender.Female,
        isPremium: true,
        isVerified: true,
        preferences: {
            interestedIn: [Gender.Male],
            ageRange: { min: 28, max: 38 },
            relationshipIntent: 'Serious',
            communicationStyle: 'Calls',
            activityLevel: 'Active',
        },
    },
    {
        id: 5,
        name: 'Eva',
        age: 27,
        bio: 'Musician and artist. I play guitar and paint in my spare time. I\'m a bit of a homebody but can be convinced to go to a concert or art gallery.',
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        interests: ['Music', 'Painting', 'Concerts', 'Cats'],
        gender: Gender.Female,
        isPremium: false,
        isVerified: false,
        preferences: {
            interestedIn: [Gender.Male],
            ageRange: { min: 25, max: 35 },
            relationshipIntent: 'Exploring',
            communicationStyle: 'Texting',
            activityLevel: 'Relaxed',
        },
    },
];

let datePosts: DatePost[] = [
    {
        id: 1,
        title: 'Stargazing & S\'mores Night',
        description: 'Let\'s escape the city lights for a bit. I\'ll bring the telescope and all the fixings for s\'mores if you bring a cozy blanket and good conversation. A perfect, low-key way to get to know each other.',
        location: 'Lookout Point',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 4, // Diana
        applicants: [1],
        priorityApplicants: [1],
        chosenApplicantId: null,
        categories: ['Outdoors & Adventure', 'Relaxing & Casual'],
    },
    {
        id: 2,
        title: 'Competitive Board Game Cafe',
        description: 'Ready for a challenge? Let\'s battle it out over a game of Catan or Ticket to Ride. Loser buys the winner a fancy coffee or hot chocolate. May the best strategist win!',
        location: 'The Meeple\'s Corner Cafe',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 1, // Alex
        applicants: [2, 5],
        priorityApplicants: [],
        chosenApplicantId: null,
        categories: ['Food & Drink', 'Relaxing & Casual'],
        businessId: 101, // Link to The Meeple's Corner
        dealId: 1,
    },
    {
        id: 3,
        title: 'Explore the Modern Art Museum',
        description: 'Let\'s wander through the museum and pretend we\'re fancy art critics. We can talk about what we think the artists were *really* trying to say. Followed by a walk and ice cream.',
        location: 'Downtown Modern Art Museum',
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 2, // Brenda
        applicants: [],
        priorityApplicants: [],
        chosenApplicantId: null,
        categories: ['Arts & Culture'],
    },
];

let messages: Message[] = [
    { id: 1, senderId: 1, receiverId: 2, text: 'Hey Brenda! I saw you\'re into vintage stuff. I just found this old record player, any tips for a newbie?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 2, senderId: 2, receiverId: 1, text: 'Oh that\'s awesome! The first rule is to be gentle with the needle. What kind is it?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 3, senderId: 1, receiverId: 4, text: 'Your travel photos look incredible, Diana! What was your favorite place you\'ve visited?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: true },
];

let matches: { [userId: number]: number[] } = { 1: [2, 4] };
let swipes: { [userId: number]: { left: number[], right: number[] } } = { 1: { left: [5], right: [2, 4] } };

let businesses: Business[] = [
    {
        id: 101,
        name: "The Meeple's Corner Cafe",
        description: "A cozy and welcoming board game cafe with a library of over 500 games. We serve specialty coffees, craft beers, and delicious sandwiches. The perfect place for a playful and strategic date night.",
        address: "123 Main Street, Downtown",
        category: "Relaxing & Casual",
        photos: [
            'https://images.unsplash.com/photo-1559925393-53359d22c2a8?q=80&w=1170&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1596783216853-23b037330a84?q=80&w=1170&auto=format&fit=crop'
        ],
        website: "https://themeeplescorner.com",
        status: 'approved',
    },
    {
        id: 102,
        name: "Vino & Vibe",
        description: "An elegant wine bar featuring a curated selection of international wines, artisanal cheese boards, and a romantic, softly-lit ambiance. Ideal for deep conversations and a sophisticated evening.",
        address: "456 Wine Avenue, Arts District",
        category: "Nightlife",
        photos: [
            'https://images.unsplash.com/photo-1510812431410-15a452a321a9?q=80&w=1170&auto=format&fit=crop'
        ],
        status: 'approved',
    },
];

let deals: Deal[] = [
    {
        id: 1,
        businessId: 101,
        title: "Free Game Pass",
        description: "Get a free all-day game pass ($10 value) when you spend $25 on food and drinks. Mention Create-A-Date when ordering.",
        commissionRate: 0.15,
    },
    {
        id: 2,
        businessId: 102,
        title: "20% Off First Bottle",
        description: "Enjoy 20% off your first bottle of wine for your date night. Let your server know you're on a Create-A-Date!",
        commissionRate: 0.15,
    },
];


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- READ operations
export const getUsers = async (): Promise<User[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(users));
};

export const getDatePosts = async (): Promise<DatePost[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(datePosts)).sort((a: DatePost, b: DatePost) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
};

export const getMessages = async (): Promise<Message[]> => {
    await delay(100);
    return JSON.parse(JSON.stringify(messages));
};

export const getMatches = async (currentUserId: number): Promise<number[]> => {
    await delay(100);
    return matches[currentUserId] || [];
};

export const getSwipedLeftIds = async (currentUserId: number): Promise<number[]> => {
    await delay(100);
    return swipes[currentUserId]?.left || [];
};

export const getLocalEvents = async (location?: string): Promise<LocalEvent[]> => {
    if (!location || location.trim() === '') {
        return [];
    }
    try {
        const events = await getRealtimeEvents(location);
        return events;
    } catch (error) {
        console.error("API: Failed to get realtime events", error);
        return [];
    }
};

export const getBusinesses = async (): Promise<Business[]> => {
    await delay(500);
    return JSON.parse(JSON.stringify(businesses.filter(b => b.status === 'approved')));
};

export const getDealsForBusiness = async (businessId: number): Promise<Deal[]> => {
    await delay(100);
    // returning all deals for mock purposes
    return JSON.parse(JSON.stringify(deals));
};

export const getLeaderboard = async (): Promise<(User & { score: number })[]> => {
    await delay(400);
    // Mock leaderboard logic
    return users
        .map(u => ({ ...u, score: Math.floor(Math.random() * 5000) + (datePosts.filter(d => d.createdBy === u.id).length * 1000) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
};


// --- WRITE operations
export const createDate = async (newDateData: Omit<DatePost, 'id'>): Promise<DatePost> => {
    await delay(300);
    const newId = datePosts.length > 0 ? Math.max(...datePosts.map(p => p.id)) + 1 : 1;
    const newPost: DatePost = {
        id: newId,
        ...newDateData,
    };
    datePosts.push(newPost);
    return JSON.parse(JSON.stringify(newPost));
};

export const sendMessage = async (senderId: number, receiverId: number, text: string): Promise<Message> => {
    await delay(150);
    const newMessage: Message = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
    };
    messages.push(newMessage);
    return JSON.parse(JSON.stringify(newMessage));
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    await delay(300);
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex > -1) {
        users[userIndex] = updatedUser;
        return JSON.parse(JSON.stringify(updatedUser));
    }
    throw new Error("User not found");
};

export const updateDatePost = async (updatedPost: DatePost): Promise<DatePost> => {
    await delay(200);
    const postIndex = datePosts.findIndex(p => p.id === updatedPost.id);
    if (postIndex > -1) {
        datePosts[postIndex] = updatedPost;
        return JSON.parse(JSON.stringify(updatedPost));
    }
    throw new Error("Date post not found");
};

export const expressPriorityInterest = async (userId: number, dateId: number): Promise<DatePost> => {
    await delay(200);
    const postIndex = datePosts.findIndex(p => p.id === dateId);
    if (postIndex > -1) {
        const post = datePosts[postIndex];
        if (!post.priorityApplicants) {
            post.priorityApplicants = [];
        }
        if (!post.priorityApplicants.includes(userId)) {
            post.priorityApplicants.push(userId);
            if (!post.applicants.includes(userId)) {
                post.applicants.push(userId);
            }
        }
        datePosts[postIndex] = post;
        return JSON.parse(JSON.stringify(post));
    }
    throw new Error("Date post not found");
};

export const deleteDatePost = async (dateId: number): Promise<void> => {
    await delay(300);
    datePosts = datePosts.filter(p => p.id !== dateId);
};

export const recordSwipe = async (userId: number, swipedUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    await delay(100);
    if (!swipes[userId]) {
        swipes[userId] = { left: [], right: [] };
    }
    if (direction === 'left') {
        if (!swipes[userId].left.includes(swipedUserId)) swipes[userId].left.push(swipedUserId);
    } else {
        if (!swipes[userId].right.includes(swipedUserId)) swipes[userId].right.push(swipedUserId);
    }

    const otherUserSwipes = swipes[swipedUserId];
    if (direction === 'right' && otherUserSwipes?.right.includes(userId)) {
        if (!matches[userId]) matches[userId] = [];
        if (!matches[swipedUserId]) matches[swipedUserId] = [];
        if (!matches[userId].includes(swipedUserId)) matches[userId].push(swipedUserId);
        if (!matches[swipedUserId].includes(userId)) matches[swipedUserId].push(userId);
        return { isMatch: true };
    }

    return { isMatch: false };
};

export const recordSuperLike = async (userId: number, swipedUserId: number): Promise<{ isMatch: boolean }> => {
    await delay(150);
    // This is essentially the same as a right swipe, but in a real app would trigger notifications etc.
    return recordSwipe(userId, swipedUserId, 'right');
};

export const recallSwipe = async (userId: number, lastSwipedUserId: number): Promise<void> => {
    await delay(100);
    if (swipes[userId]) {
        swipes[userId].left = swipes[userId].left.filter(id => id !== lastSwipedUserId);
        swipes[userId].right = swipes[userId].right.filter(id => id !== lastSwipedUserId);
    }
    // Also remove match if it was created
    if (matches[userId]) {
        matches[userId] = matches[userId].filter(id => id !== lastSwipedUserId);
    }
    if (matches[lastSwipedUserId]) {
        matches[lastSwipedUserId] = matches[lastSwipedUserId].filter(id => id !== userId);
    }
};

export const submitBusinessApplication = async (businessData: Omit<Business, 'id' | 'status'>): Promise<Business> => {
    await delay(1000);
    const newId = businesses.length > 0 ? Math.max(...businesses.map(b => b.id)) + 100 : 201;
    const newBusiness: Business = {
        id: newId,
        ...businessData,
        status: 'pending' // All new signups are pending approval
    };
    businesses.push(newBusiness);
    console.log("New business application submitted:", newBusiness);
    return JSON.parse(JSON.stringify(newBusiness));
};