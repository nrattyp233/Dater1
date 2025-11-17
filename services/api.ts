import { supabase } from './supabaseClient';
import { User, DatePost, Message, Business, Deal, LocalEvent, Gender } from '../types';
import { getRealtimeEvents } from './geminiService';

// --- TYPE MAPPERS ---
// Supabase uses snake_case, our app uses camelCase. These helpers convert between them.

const toUser = (data: any): User => ({
    id: data.id,
    name: data.name,
    age: data.age,
    bio: data.bio,
    photos: data.photos || [],
    interests: data.interests || [],
    gender: data.gender,
    isPremium: data.is_premium,
    isVerified: data.is_verified,
    preferences: data.preferences || {},
    earnedBadgeIds: data.earned_badge_ids || [],
});

const fromUser = (user: Partial<User>) => ({
    name: user.name,
    age: user.age,
    bio: user.bio,
    photos: user.photos,
    interests: user.interests,
    gender: user.gender,
    is_premium: user.isPremium,
    is_verified: user.isVerified,
    preferences: user.preferences,
    earned_badge_ids: user.earnedBadgeIds,
});

const toDatePost = (data: any): DatePost => ({
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location,
    dateTime: data.date_time,
    createdBy: data.created_by,
    applicants: data.applicants || [],
    priorityApplicants: data.priority_applicants || [],
    chosenApplicantId: data.chosen_applicant_id,
    categories: data.categories || [],
    businessId: data.business_id,
    dealId: data.deal_id,
});

const fromDatePost = (post: Partial<DatePost>) => ({
    title: post.title,
    description: post.description,
    location: post.location,
    date_time: post.dateTime,
    created_by: post.createdBy,
    applicants: post.applicants,
    priority_applicants: post.priorityApplicants,
    chosen_applicant_id: post.chosenApplicantId,
    categories: post.categories,
    business_id: post.businessId,
    deal_id: post.dealId,
});

const toMessage = (data: any): Message => ({
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    text: data.text,
    timestamp: data.timestamp,
    read: data.read,
});

const toBusiness = (data: any): Business => ({
    id: data.id,
    name: data.name,
    description: data.description,
    address: data.address,
    category: data.category,
    photos: data.photos || [],
    website: data.website,
    status: data.status,
});

const fromBusiness = (business: Partial<Business>) => ({
    name: business.name,
    description: business.description,
    address: business.address,
    category: business.category,
    photos: business.photos,
    website: business.website,
    status: business.status,
});

const toDeal = (data: any): Deal => ({
    id: data.id,
    businessId: data.business_id,
    title: data.title,
    description: data.description,
    commissionRate: data.commission_rate,
});


// --- AUTH & USER ---
export const getCurrentUserProfile = async (): Promise<User | null> => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    // 1. Attempt to fetch the user profile
    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

    // If profile exists, return it
    if (profile) {
        return toUser(profile);
    }

    // 2. If profile doesn't exist (specific error code), create it.
    // This makes the app resilient to cases where an auth user exists without a public profile (e.g., after DB resets).
    if (error && error.code === 'PGRST116') {
        console.warn(`Profile not found for user ${authUser.id}. Creating a new one.`);
        
        // Attempt to use metadata from auth, with sensible fallbacks.
        const gender = (authUser.user_metadata?.gender as Gender) || Gender.Male;
        const interestedIn = gender === Gender.Male ? [Gender.Female] : [Gender.Male];

        const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
                auth_id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'New User',
                age: authUser.user_metadata?.age || 18,
                bio: 'Welcome to my profile! Please update your details in the settings.',
                photos: ['https://ionicframework.com/docs/img/demos/avatar.svg'],
                interests: [],
                gender: gender,
                preferences: {
                    interestedIn: interestedIn,
                    ageRange: { min: 18, max: 99 },
                    relationshipIntent: 'Exploring',
                    communicationStyle: 'Texting',
                    activityLevel: 'Bit of both',
                }
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating user profile after failed fetch:', insertError);
            if (insertError.code === '42501') {
                // This is a specific RLS violation error. Throw it so the UI can handle it.
                throw new Error("Database security policy is preventing profile creation. Please ask an administrator to add an INSERT policy to the 'users' table.");
            }
            return null;
        }
        
        console.log('Successfully created fallback profile for user:', authUser.id);
        return toUser(newProfile);
    }

    // 3. If there was some other error fetching, log it and return null
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    // This case should ideally not be reached if there's no data and no error
    return null;
};


export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(toUser);
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .update(fromUser(updatedUser))
        .eq('id', updatedUser.id)
        .select()
        .single();
    if (error) throw error;
    return toUser(data);
};

// --- DATES ---
export const getDatePosts = async (): Promise<DatePost[]> => {
    const { data, error } = await supabase.from('date_posts').select('*').order('date_time', { ascending: false });
    if (error) throw error;
    return data.map(toDatePost);
};

export const createDate = async (newDateData: Omit<DatePost, 'id'>): Promise<DatePost> => {
    const { data, error } = await supabase
        .from('date_posts')
        .insert(fromDatePost(newDateData))
        .select()
        .single();
    if (error) throw error;
    return toDatePost(data);
};

export const updateDatePost = async (updatedPost: DatePost): Promise<DatePost> => {
    const { data, error } = await supabase
        .from('date_posts')
        .update(fromDatePost(updatedPost))
        .eq('id', updatedPost.id)
        .select()
        .single();
    if (error) throw error;
    return toDatePost(data);
};

export const expressPriorityInterest = async (userId: number, dateId: number): Promise<DatePost> => {
    const { data, error } = await supabase.rpc('add_priority_applicant', {
        p_date_id: dateId,
        p_user_id: userId
    });
    if (error) throw error;
    // RPC returns the updated row
    return toDatePost(data);
};

export const deleteDatePost = async (dateId: number): Promise<void> => {
    const { error } = await supabase.from('date_posts').delete().eq('id', dateId);
    if (error) throw error;
};

// --- SWIPING & MATCHING ---
export const getMatches = async (currentUserId: number): Promise<number[]> => {
    const { data, error } = await supabase
        .from('matches')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`);
    if (error) throw error;
    return data.map(match => match.user_id_1 === currentUserId ? match.user_id_2 : match.user_id_1);
};

export const getSwipedLeftIds = async (currentUserId: number): Promise<number[]> => {
    const { data, error } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', currentUserId)
        .eq('direction', 'left');
    if (error) throw error;
    return data.map(swipe => swipe.swiped_id);
};

export const recordSwipe = async (userId: number, swipedUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    // Insert the swipe
    const { error: swipeError } = await supabase.from('swipes').insert({
        swiper_id: userId,
        swiped_id: swipedUserId,
        direction,
    });
    if (swipeError) throw swipeError;

    if (direction === 'right') {
        // Check if the other user has swiped right on us
        const { data, error: matchCheckError } = await supabase
            .from('swipes')
            .select('swiper_id')
            .eq('swiper_id', swipedUserId)
            .eq('swiped_id', userId)
            .eq('direction', 'right')
            .limit(1);
        
        if (matchCheckError) throw matchCheckError;

        if (data && data.length > 0) {
            // It's a match!
            const user1 = Math.min(userId, swipedUserId);
            const user2 = Math.max(userId, swipedUserId);
            const { error: matchError } = await supabase.from('matches').insert({
                user_id_1: user1,
                user_id_2: user2,
            });
            if (matchError) {
                // Ignore unique constraint violation if match already exists
                if (matchError.code !== '23505') throw matchError;
            }
            return { isMatch: true };
        }
    }
    return { isMatch: false };
};

export const recordSuperLike = (userId: number, swipedUserId: number) => recordSwipe(userId, swipedUserId, 'right');

export const recallSwipe = async (userId: number, lastSwipedUserId: number): Promise<void> => {
    const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('swiper_id', userId)
        .eq('swiped_id', lastSwipedUserId);
    if (error) throw error;
};

// --- MESSAGING ---
export const getMessages = async (): Promise<Message[]> => {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) throw error;
    return data.map(toMessage);
};

export const sendMessage = async (senderId: number, receiverId: number, text: string): Promise<Message> => {
    const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: senderId, receiver_id: receiverId, text })
        .select()
        .single();
    if (error) throw error;
    return toMessage(data);
};

// --- BUSINESS & EXTERNAL ---
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
    if (error) throw error;
    return data.map(toBusiness);
};

export const getDealsForBusiness = async (businessId: number): Promise<Deal[]> => {
    // For now, get all deals as there aren't many
    const { data, error } = await supabase.from('deals').select('*');
    if (error) throw error;
    return data.map(toDeal);
};

export const submitBusinessApplication = async (businessData: Omit<Business, 'id' | 'status'>): Promise<Business> => {
    const { data, error } = await supabase
        .from('businesses')
        .insert(fromBusiness({ ...businessData, status: 'pending' }))
        .select()
        .single();
    if (error) throw error;
    return toBusiness(data);
};

// --- LEADERBOARD ---
export const getLeaderboard = async (): Promise<(User & { score: number })[]> => {
    // This would ideally be a database function (RPC) for performance
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');
    const { data: postsData, error: postsError } = await supabase.from('date_posts').select('created_by, applicants');
    if (usersError || postsError) throw usersError || postsError;

    const scores = usersData.map(u => {
        const postsCreated = postsData.filter(p => p.created_by === u.id);
        const applicantsReceived = postsCreated.reduce((sum, p) => sum + (p.applicants?.length || 0), 0);
        const score = (postsCreated.length * 100) + (applicantsReceived * 10);
        return { ...toUser(u), score };
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, 10);
};