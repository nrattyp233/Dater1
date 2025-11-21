
import { User, DatePost, Message, Business, Deal, LocalEvent, Gender } from '../types';
import { getRealtimeEvents } from './geminiService';

// --- PERSISTENCE KEYS ---
const KEYS = {
    USERS: 'cad_users',
    POSTS: 'cad_posts',
    MESSAGES: 'cad_messages',
    MATCHES: 'cad_matches',
    SWIPES: 'cad_swipes',
    BUSINESSES: 'cad_businesses',
    CURRENT_USER: 'cad_current_user_id',
    CREDS: 'cad_auth_creds',
    BLOCKED: 'cad_blocked_users' // NEW KEY
};

// --- INITIAL MOCK DATA ---
const INITIAL_USERS: User[] = [
    {
        id: 1,
        name: "Alex",
        age: 28,
        location: "Denver, CO",
        bio: "Adventure seeker and coffee enthusiast. Always looking for the next great hiking spot.",
        photos: [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800"
        ],
        interests: ["Hiking", "Coffee", "Photography", "Travel"],
        gender: Gender.Male,
        isPremium: false,
        isVerified: true,
        preferences: {
            interestedIn: [Gender.Female],
            ageRange: { min: 24, max: 35 },
            relationshipIntent: "Serious",
            communicationStyle: "Texting",
            activityLevel: "Active"
        },
        earnedBadgeIds: ["starter"]
    },
    {
        id: 2,
        name: "Sarah",
        age: 26,
        location: "Denver, CO",
        bio: "Art lover and foodie. I know the best taco spots in town!",
        photos: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800"
        ],
        interests: ["Art", "Foodie", "Music", "Festivals"],
        gender: Gender.Female,
        isPremium: true,
        isVerified: true,
        preferences: {
            interestedIn: [Gender.Male],
            ageRange: { min: 25, max: 32 },
            relationshipIntent: "Casual",
            communicationStyle: "Calls",
            activityLevel: "Bit of both"
        },
        earnedBadgeIds: ["first_date", "adventurous"]
    },
    {
        id: 3,
        name: "Jessica",
        age: 24,
        location: "New York, NY",
        bio: "City girl loving the fast life. Let's grab a drink on a rooftop.",
        photos: [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800"
        ],
        interests: ["Nightlife", "Fashion", "Cocktails", "Running"],
        gender: Gender.Female,
        isPremium: false,
        isVerified: false,
        preferences: {
             interestedIn: [Gender.Male],
             ageRange: { min: 24, max: 35 },
             relationshipIntent: "Casual",
             communicationStyle: "Texting",
             activityLevel: "Active"
        },
         earnedBadgeIds: []
    },
    {
        id: 4,
        name: "Marcus",
        age: 30,
        location: "San Francisco, CA",
        bio: "Tech founder by day, surfer by weekend. Looking for someone to catch waves with.",
        photos: [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
        ],
        interests: ["Tech", "Surfing", "Startups", "Sushi"],
        gender: Gender.Male,
        isPremium: true,
        isVerified: true,
        preferences: {
             interestedIn: [Gender.Female],
             ageRange: { min: 24, max: 30 },
             relationshipIntent: "Serious",
             communicationStyle: "In-person",
             activityLevel: "Active"
        },
         earnedBadgeIds: ["prolific_planner"]
    },
    {
        id: 5,
        name: "Elena",
        age: 27,
        location: "Denver, CO",
        bio: "Yoga instructor and plant mom. Let's connect over tea.",
        photos: [
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800",
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800"
        ],
        interests: ["Yoga", "Plants", "Meditation", "Tea"],
        gender: Gender.Female,
        isPremium: false,
        isVerified: true,
        preferences: {
             interestedIn: [Gender.Male],
             ageRange: { min: 26, max: 35 },
             relationshipIntent: "Serious",
             communicationStyle: "Calls",
             activityLevel: "Relaxed"
        },
         earnedBadgeIds: []
    }
];

const INITIAL_POSTS: DatePost[] = [
    {
        id: 101,
        title: "Weekend Hiking Adventure",
        description: "Planning to hike the Skyline Trail this Saturday morning. Great views and fresh air guaranteed! Who's up for it?",
        location: "Blue Ridge Mountains",
        dateTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        createdBy: 1,
        applicants: [2],
        priorityApplicants: [],
        chosenApplicantId: null,
        categories: ["Outdoors & Adventure", "Active & Fitness"],
    }
];

const INITIAL_BUSINESSES: Business[] = [
    {
        id: 1,
        name: "The Rusty Spoon",
        description: "Farm-to-table dining experience with a cozy atmosphere.",
        address: "123 Main St, Downtown",
        category: "Food & Drink",
        photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800"],
        website: "https://example.com",
        status: "approved"
    }
];

const INITIAL_DEALS: Deal[] = [
     {
        id: 1,
        businessId: 1,
        title: "Free Appetizer",
        description: "Get a free appetizer with the purchase of two entrees.",
        commissionRate: 0.15
    }
];

// --- DATA LAYER UTILS ---

const load = <T>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
        console.error(`Failed to load ${key}`, e);
        return fallback;
    }
};

const save = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save ${key}`, e);
    }
};

// --- STATE MANAGEMENT ---
let users = load<User[]>(KEYS.USERS, INITIAL_USERS);
let datePosts = load<DatePost[]>(KEYS.POSTS, INITIAL_POSTS);
let messages = load<Message[]>(KEYS.MESSAGES, []);
let matches = load<{ user1: number, user2: number }[]>(KEYS.MATCHES, []);
let swipes = load<{ swiperId: number, swipedId: number, direction: 'left' | 'right' }[]>(KEYS.SWIPES, []);
let businesses = load<Business[]>(KEYS.BUSINESSES, INITIAL_BUSINESSES);
let currentUserId = load<number | null>(KEYS.CURRENT_USER, null);
let blockedUsers = load<{ blockerId: number, blockedId: number }[]>(KEYS.BLOCKED, []);

// --- AUTH CREDENTIALS STORE ---
// Format: { [email: string]: { password: string, userId: number } }
let creds = load<Record<string, {password: string, userId: number}>>(KEYS.CREDS, {
    'test@test.com': { password: 'password', userId: 1 }, // Default user for testing
});

const sync = () => {
    save(KEYS.USERS, users);
    save(KEYS.POSTS, datePosts);
    save(KEYS.MESSAGES, messages);
    save(KEYS.MATCHES, matches);
    save(KEYS.SWIPES, swipes);
    save(KEYS.BUSINESSES, businesses);
    save(KEYS.CURRENT_USER, currentUserId);
    save(KEYS.CREDS, creds);
    save(KEYS.BLOCKED, blockedUsers);
};

// --- HELPER FOR BLOCKING ---
const isBlocked = (id1: number, id2: number) => {
    return blockedUsers.some(b => 
        (b.blockerId === id1 && b.blockedId === id2) || 
        (b.blockerId === id2 && b.blockedId === id1)
    );
};

// --- API METHODS ---

export const signUp = async (email: string, password: string, name: string, age: number, gender: Gender): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (creds[email.toLowerCase()]) {
        throw new Error("User already exists with this email.");
    }

    const newUser: User = {
        id: Date.now(),
        name: name,
        age: age,
        location: "Denver, CO", // Default location for new users in simulation
        bio: "I'm new here! Just joined Create-A-Date.",
        photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"], // Default avatar
        interests: [],
        gender: gender,
        isPremium: false,
        isVerified: false,
        preferences: {
            interestedIn: [gender === Gender.Male ? Gender.Female : Gender.Male],
            ageRange: { min: 18, max: 99 },
            relationshipIntent: 'Exploring',
            communicationStyle: 'Texting',
            activityLevel: 'Bit of both',
        }
    };

    users.push(newUser);
    creds[email.toLowerCase()] = { password, userId: newUser.id };
    currentUserId = newUser.id;
    sync();
    return newUser;
};

export const signIn = async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const record = creds[email.toLowerCase()];
    
    if (!record) {
        throw new Error("No account found with this email.");
    }

    if (record.password !== password) {
        throw new Error("Incorrect password.");
    }

    const user = users.find(u => u.id === record.userId);
    if (!user) {
        throw new Error("User profile data is missing.");
    }

    currentUserId = user.id;
    sync();
    return user;
};

export const getCurrentUserProfile = async (): Promise<User | null> => {
    if (!currentUserId) return null;
    return users.find(u => u.id === currentUserId) || null;
};

export const getUsers = async (): Promise<User[]> => {
    // Filter out blocked users
    if (!currentUserId) return users;
    return users.filter(u => !isBlocked(currentUserId!, u.id));
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    sync();
    return updatedUser;
};

export const getDatePosts = async (): Promise<DatePost[]> => {
    return datePosts;
};

export const createDate = async (newDateData: Omit<DatePost, 'id'>): Promise<DatePost> => {
    const newPost: DatePost = {
        ...newDateData,
        id: Date.now(),
    };
    datePosts.unshift(newPost);
    sync();
    return newPost;
};

export const updateDatePost = async (updatedPost: DatePost): Promise<DatePost> => {
    datePosts = datePosts.map(p => p.id === updatedPost.id ? updatedPost : p);
    sync();
    return updatedPost;
};

export const expressPriorityInterest = async (userId: number, dateId: number): Promise<DatePost> => {
    const post = datePosts.find(p => p.id === dateId);
    if (post) {
        if (!post.applicants.includes(userId)) post.applicants.push(userId);
        if (!post.priorityApplicants?.includes(userId)) {
            post.priorityApplicants = [...(post.priorityApplicants || []), userId];
        }
        sync();
        return post;
    }
    throw new Error("Date not found");
};

export const deleteDatePost = async (dateId: number): Promise<void> => {
    datePosts = datePosts.filter(p => p.id !== dateId);
    sync();
};

export const getMatches = async (userId: number): Promise<number[]> => {
    return matches
        .filter(m => (m.user1 === userId || m.user2 === userId) && !isBlocked(userId, m.user1 === userId ? m.user2 : m.user1))
        .map(m => m.user1 === userId ? m.user2 : m.user1);
};

export const getSwipedLeftIds = async (userId: number): Promise<number[]> => {
    return swipes
        .filter(s => s.swiperId === userId && s.direction === 'left')
        .map(s => s.swipedId);
};

export const recordSwipe = async (userId: number, swipedUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    swipes.push({ swiperId: userId, swipedId: swipedUserId, direction });
    
    let isMatch = false;
    if (direction === 'right') {
        const otherSwiped = swipes.find(s => s.swiperId === swipedUserId && s.swipedId === userId && s.direction === 'right');
        
        if (otherSwiped) {
            matches.push({ user1: userId, user2: swipedUserId });
            isMatch = true;
        }
    }
    sync();
    return { isMatch };
};

export const recordSuperLike = async (userId: number, swipedUserId: number): Promise<{ isMatch: boolean }> => {
    return recordSwipe(userId, swipedUserId, 'right');
};

export const recallSwipe = async (userId: number, lastSwipedUserId: number): Promise<void> => {
    swipes = swipes.filter(s => !(s.swiperId === userId && s.swipedId === lastSwipedUserId));
    matches = matches.filter(m => !((m.user1 === userId && m.user2 === lastSwipedUserId) || (m.user1 === lastSwipedUserId && m.user2 === userId)));
    sync();
};

export const getMessages = async (): Promise<Message[]> => {
    // Filter messages where either sender or receiver is blocked
    if (!currentUserId) return [];
    return messages.filter(m => !isBlocked(currentUserId!, m.senderId) && !isBlocked(currentUserId!, m.receiverId));
};

export const sendMessage = async (senderId: number, receiverId: number, text: string): Promise<Message> => {
    const newMessage: Message = {
        id: Date.now(),
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        read: false
    };
    messages.push(newMessage);
    sync();
    return newMessage;
};

// --- REPORTING & BLOCKING API ---

export const blockUser = async (blockerId: number, blockedId: number): Promise<void> => {
    if (isBlocked(blockerId, blockedId)) return;
    blockedUsers.push({ blockerId, blockedId });
    
    // Clean up matches if they exist
    matches = matches.filter(m => 
        !((m.user1 === blockerId && m.user2 === blockedId) || (m.user1 === blockedId && m.user2 === blockerId))
    );
    
    sync();
};

export const reportUser = async (reporterId: number, reportedId: number, reason: string): Promise<void> => {
    console.log(`[REPORT] User ${reporterId} reported ${reportedId} for: ${reason}`);
    // In a real app, this would send data to a backend moderation queue.
    // For this simulation, we just log it.
};

export const getLocalEvents = async (location?: string): Promise<LocalEvent[]> => {
    if (!location || location.trim() === '') return [];
    try {
        return await getRealtimeEvents(location);
    } catch (error) {
        console.error("API: Failed to get realtime events", error);
        return [];
    }
};

export const getBusinesses = async (): Promise<Business[]> => {
    return businesses;
};

export const getDealsForBusiness = async (businessId: number): Promise<Deal[]> => {
    return INITIAL_DEALS; 
};

export const submitBusinessApplication = async (businessData: Omit<Business, 'id' | 'status'>): Promise<Business> => {
    const newBusiness = { ...businessData, id: Date.now(), status: 'pending' as const };
    businesses.push(newBusiness);
    sync();
    return newBusiness;
};

export const getLeaderboard = async (): Promise<(User & { score: number })[]> => {
    const scores = users.map(u => {
        const postsCreated = datePosts.filter(p => p.createdBy === u.id);
        const applicantsReceived = postsCreated.reduce((sum, p) => sum + (p.applicants?.length || 0), 0);
        const score = (postsCreated.length * 100) + (applicantsReceived * 10);
        return { ...u, score };
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, 10);
};

export const simulateNetworkActivity = (currentUserId: number, notify: (msg: string) => void) => {
    // Minimal simulation for alive feel
};
