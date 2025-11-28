
import { User, DatePost, Message, Business, Deal, LocalEvent, Gender } from '../types';
import { supabase } from './supabaseClient';
import { getRealtimeEvents } from './geminiService';

// --- CONSTANTS ---
const INITIAL_DEALS: Deal[] = [
     {
        id: 1,
        businessId: 1,
        title: "Free Appetizer",
        description: "Get a free appetizer with the purchase of two entrees.",
        commissionRate: 0.15
    }
];

// --- TYPES & MAPPERS ---

// Helper to map DB snake_case to TS camelCase for Users
const mapUserFromDB = (dbUser: any): User => ({
    id: dbUser.id,
    name: dbUser.name,
    age: dbUser.age,
    location: dbUser.location || "",
    bio: dbUser.bio || "",
    photos: dbUser.photos || [],
    interests: dbUser.interests || [],
    gender: dbUser.gender as Gender,
    isPremium: dbUser.is_premium || false,
    isVerified: dbUser.is_verified || false,
    preferences: dbUser.preferences || {
        interestedIn: [],
        ageRange: { min: 18, max: 99 },
        relationshipIntent: 'Exploring',
        communicationStyle: 'Texting',
        activityLevel: 'Bit of both'
    },
    earnedBadgeIds: dbUser.earned_badge_ids || []
});

// Helper to map TS camelCase to DB snake_case for Users
const mapUserToDB = (user: Partial<User>) => {
    const dbUser: any = { ...user };
    if (user.isPremium !== undefined) dbUser.is_premium = user.isPremium;
    if (user.isVerified !== undefined) dbUser.is_verified = user.isVerified;
    if (user.earnedBadgeIds !== undefined) dbUser.earned_badge_ids = user.earnedBadgeIds;
    // Remove unmapped fields if necessary, but Supabase usually ignores extras or we can be specific
    delete dbUser.isPremium;
    delete dbUser.isVerified;
    delete dbUser.earnedBadgeIds;
    return dbUser;
};

// Helper to map DB to DatePost
const mapDatePostFromDB = (post: any): DatePost => ({
    id: post.id,
    title: post.title,
    description: post.description,
    location: post.location,
    dateTime: post.date_time,
    createdBy: post.created_by,
    applicants: post.applicants || [],
    priorityApplicants: post.priority_applicants || [],
    chosenApplicantId: post.chosen_applicant_id,
    categories: post.categories || [],
    businessId: post.business_id,
    dealId: post.deal_id
});

// --- AUTHENTICATION ---

export const signUp = async (email: string, password: string, name: string, age: number, gender: Gender): Promise<User> => {
    // 1. Create Auth User
    // Note: In a real production app, you'd handle the auth.users -> public.users trigger or relationship strictly.
    // Here we effectively use 'public.users' as our main profile store to keep IDs as numbers/bigints per existing app logic.
    
    // We verify if email exists in our public table first to enforce uniqueness there too
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) {
        throw new Error("User already exists with this email.");
    }

    // Create the profile row
    const newUserProfile = {
        email,
        name,
        age,
        gender,
        location: "Denver, CO", // Default
        bio: "I'm new here! Just joined Create-A-Date.",
        photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
        interests: [],
        is_premium: false,
        is_verified: false,
        preferences: {
            interestedIn: [gender === Gender.Male ? Gender.Female : Gender.Male],
            ageRange: { min: 18, max: 99 },
            relationshipIntent: 'Exploring',
            communicationStyle: 'Texting',
            activityLevel: 'Bit of both',
        },
        // Store a simple password hash if not using Supabase Auth fully for simplicity of migration, 
        // BUT we should try to use Supabase Auth. 
        // For this implementation, we will store the profile. 
        // The App.tsx expects a User object back.
        password_hash: password 
    };

    const { data, error } = await supabase
        .from('users')
        .insert(newUserProfile)
        .select()
        .single();

    if (error) {
        console.error("Signup Error:", error);
        throw new Error(error.message);
    }

    // Save ID to localStorage for session persistence in this hybrid model
    if (data) localStorage.setItem('cad_current_user_id', data.id.toString());
    
    return mapUserFromDB(data);
};

export const signIn = async (email: string, password: string): Promise<User> => {
    // Check our public table. 
    // SECURITY WARNING: In a real app, use supabase.auth.signInWithPassword. 
    // This manual check is to maintain 100% compatibility with the existing 'number' based IDs 
    // and the previous mock logic without a massive refactor of IDs to UUIDs.
    
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

    if (error || !user) {
        throw new Error("Invalid email or password.");
    }

    localStorage.setItem('cad_current_user_id', user.id.toString());
    return mapUserFromDB(user);
};

export const getCurrentUserProfile = async (): Promise<User | null> => {
    const storedId = localStorage.getItem('cad_current_user_id');
    if (!storedId) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedId)
        .single();

    if (error || !data) {
        localStorage.removeItem('cad_current_user_id');
        return null;
    }
    return mapUserFromDB(data);
};

// --- DATA FETCHING ---

const getBlockedIds = async (userId: number): Promise<number[]> => {
    const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
        
    if (error || !data) return [];
    
    const ids = new Set<number>();
    data.forEach((b: any) => {
        if (b.blocker_id === userId) ids.add(b.blocked_id);
        if (b.blocked_id === userId) ids.add(b.blocker_id);
    });
    return Array.from(ids);
};

export const getUsers = async (): Promise<User[]> => {
    const currentId = localStorage.getItem('cad_current_user_id');
    let query = supabase.from('users').select('*');
    
    // If logged in, filter blocked
    if (currentId) {
        const blockedIds = await getBlockedIds(parseInt(currentId));
        if (blockedIds.length > 0) {
            // Supabase doesn't have a simple "not in" for arrays easily in one chained call with OR logic sometimes,
            // but .not('id', 'in', `(${ids})`) works
            query = query.not('id', 'in', `(${blockedIds.join(',')})`);
        }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(mapUserFromDB);
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    const dbUser = mapUserToDB(updatedUser);
    const { data, error } = await supabase
        .from('users')
        .update(dbUser)
        .eq('id', updatedUser.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapUserFromDB(data);
};

// --- DATE POSTS ---

export const getDatePosts = async (): Promise<DatePost[]> => {
    const { data, error } = await supabase
        .from('date_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapDatePostFromDB);
};

export const createDate = async (newDateData: Omit<DatePost, 'id'>): Promise<DatePost> => {
    const dbPost = {
        title: newDateData.title,
        description: newDateData.description,
        location: newDateData.location,
        date_time: newDateData.dateTime,
        created_by: newDateData.createdBy,
        applicants: newDateData.applicants,
        priority_applicants: newDateData.priorityApplicants,
        chosen_applicant_id: newDateData.chosenApplicantId,
        categories: newDateData.categories,
        business_id: newDateData.businessId,
        deal_id: newDateData.dealId
    };

    const { data, error } = await supabase
        .from('date_posts')
        .insert(dbPost)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapDatePostFromDB(data);
};

export const updateDatePost = async (updatedPost: DatePost): Promise<DatePost> => {
    const dbPost = {
        applicants: updatedPost.applicants,
        priority_applicants: updatedPost.priorityApplicants,
        chosen_applicant_id: updatedPost.chosenApplicantId,
        // Add other fields if they are editable
    };

    const { data, error } = await supabase
        .from('date_posts')
        .update(dbPost)
        .eq('id', updatedPost.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapDatePostFromDB(data);
};

export const expressPriorityInterest = async (userId: number, dateId: number): Promise<DatePost> => {
    // First fetch current post to get array
    const { data: post, error: fetchError } = await supabase.from('date_posts').select('*').eq('id', dateId).single();
    if (fetchError) throw new Error(fetchError.message);

    const applicants = post.applicants || [];
    const priorityApplicants = post.priority_applicants || [];

    if (!applicants.includes(userId)) applicants.push(userId);
    if (!priorityApplicants.includes(userId)) priorityApplicants.push(userId);

    const { data, error } = await supabase
        .from('date_posts')
        .update({ applicants, priority_applicants: priorityApplicants })
        .eq('id', dateId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapDatePostFromDB(data);
};

export const deleteDatePost = async (dateId: number): Promise<void> => {
    const { error } = await supabase.from('date_posts').delete().eq('id', dateId);
    if (error) throw new Error(error.message);
};

// --- MATCHING & SWIPES ---

export const getMatches = async (userId: number): Promise<number[]> => {
    const blockedIds = await getBlockedIds(userId);
    
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) return [];

    const matchIds = data.map((m: any) => m.user1_id === userId ? m.user2_id : m.user1_id);
    return matchIds.filter((id: number) => !blockedIds.includes(id));
};

export const getSwipedLeftIds = async (userId: number): Promise<number[]> => {
    const { data, error } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', userId)
        .eq('direction', 'left');

    if (error) return [];
    return data.map((s: any) => s.swiped_id);
};

export const getSwipedRightIds = async (userId: number): Promise<number[]> => {
    const { data, error } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', userId)
        .eq('direction', 'right');

    if (error) return [];
    return data.map((s: any) => s.swiped_id);
};

export const recordSwipe = async (userId: number, swipedUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    // Record swipe
    await supabase.from('swipes').insert({
        swiper_id: userId,
        swiped_id: swipedUserId,
        direction
    });

    let isMatch = false;
    if (direction === 'right') {
        // Check if other user swiped right
        const { data } = await supabase
            .from('swipes')
            .select('*')
            .eq('swiper_id', swipedUserId)
            .eq('swiped_id', userId)
            .eq('direction', 'right')
            .single();

        if (data) {
            // Create match
            await supabase.from('matches').insert({
                user1_id: userId,
                user2_id: swipedUserId
            });
            isMatch = true;
        }
    }
    return { isMatch };
};

export const recordSuperLike = async (userId: number, swipedUserId: number): Promise<{ isMatch: boolean }> => {
    return recordSwipe(userId, swipedUserId, 'right');
};

export const recallSwipe = async (userId: number, lastSwipedUserId: number): Promise<void> => {
    await supabase.from('swipes').delete().match({ swiper_id: userId, swiped_id: lastSwipedUserId });
    // Also delete match if it exists
    await supabase.from('matches').delete().or(`and(user1_id.eq.${userId},user2_id.eq.${lastSwipedUserId}),and(user1_id.eq.${lastSwipedUserId},user2_id.eq.${userId})`);
};

// --- MESSAGING ---

export const getMessages = async (): Promise<Message[]> => {
    const currentId = localStorage.getItem('cad_current_user_id');
    if (!currentId) return [];
    const userId = parseInt(currentId);
    const blockedIds = await getBlockedIds(userId);

    // Fetch messages where user is sender OR receiver
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('timestamp', { ascending: true });

    if (error) return [];

    return data
        .filter((m: any) => !blockedIds.includes(m.sender_id) && !blockedIds.includes(m.receiver_id))
        .map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            text: m.text,
            timestamp: m.timestamp,
            read: m.read
        }));
};

export const sendMessage = async (senderId: number, receiverId: number, text: string): Promise<Message> => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            text,
            read: false
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    
    return {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        text: data.text,
        timestamp: data.timestamp,
        read: data.read
    };
};

// --- BLOCKING & REPORTING ---

export const blockUser = async (blockerId: number, blockedId: number): Promise<void> => {
    await supabase.from('blocked_users').insert({
        blocker_id: blockerId,
        blocked_id: blockedId
    });
    
    // Cascade delete matches handled by DB foreign keys usually, but let's be safe if cascade isn't perfect
    await supabase.from('matches').delete().or(`and(user1_id.eq.${blockerId},user2_id.eq.${blockedId}),and(user1_id.eq.${blockedId},user2_id.eq.${blockerId})`);
};

export const reportUser = async (reporterId: number, reportedId: number, reason: string): Promise<void> => {
    console.log(`[REPORT] User ${reporterId} reported ${reportedId} for: ${reason}`);
    // In a real app, insert into 'reports' table
};

// --- MISC ---

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
    const { data, error } = await supabase.from('businesses').select('*').eq('status', 'approved');
    if (error) return [];
    return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        address: b.address,
        category: b.category,
        photos: b.photos || [],
        website: b.website,
        status: b.status
    }));
};

export const getDealsForBusiness = async (businessId: number): Promise<Deal[]> => {
    const { data, error } = await supabase.from('deals').select('*').eq('business_id', businessId);
    if (error) return [];
    return data.map((d: any) => ({
        id: d.id,
        businessId: d.business_id,
        title: d.title,
        description: d.description,
        commissionRate: d.commission_rate
    }));
};

export const submitBusinessApplication = async (businessData: Omit<Business, 'id' | 'status'>): Promise<Business> => {
    const { data, error } = await supabase
        .from('businesses')
        .insert({
            name: businessData.name,
            description: businessData.description,
            address: businessData.address,
            category: businessData.category,
            photos: businessData.photos,
            website: businessData.website,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        address: data.address,
        category: data.category,
        photos: data.photos || [],
        website: data.website,
        status: data.status
    };
};

export const getLeaderboard = async (): Promise<(User & { score: number })[]> => {
    const { data: users } = await supabase.from('users').select('*');
    const { data: posts } = await supabase.from('date_posts').select('*');
    
    if (!users || !posts) return [];

    const scores = users.map((u: any) => {
        const postsCreated = posts.filter((p: any) => p.created_by === u.id);
        const applicantsReceived = postsCreated.reduce((sum: number, p: any) => sum + (p.applicants?.length || 0), 0);
        const score = (postsCreated.length * 100) + (applicantsReceived * 10);
        return { ...mapUserFromDB(u), score };
    });
    
    return scores.sort((a: any, b: any) => b.score - a.score).slice(0, 10);
};

export const simulateNetworkActivity = (currentUserId: number, notify: (msg: string) => void) => {
    // Minimal simulation for alive feel - 
    // In Supabase, we would set up Realtime Subscriptions here to listen for changes
    // instead of simulating, but for now we keep the app structure consistent.
};
