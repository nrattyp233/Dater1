import { User, DatePost, Message, Gender, LocalEvent, Business, Deal, DateCategory } from '../types';
import { getRealtimeEvents } from './geminiService';
import { supabase } from './supabaseClient';

// --- DATABASE OPERATIONS ---

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Database error occurred');
};

// --- READ operations

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getDatePosts = async (userId?: number): Promise<DatePost[]> => {
  let query = supabase.from('date_posts');
  
  if (userId) {
    // If user ID is provided, only get posts they haven't applied to
    const { data: userApplications } = await supabase
      .from('date_applications')
      .select('date_post_id')
      .eq('user_id', userId);
      
    const appliedPostIds = userApplications?.map(app => app.date_post_id) || [];
    
    if (appliedPostIds.length > 0) {
      query = query.not('id', 'in', `(${appliedPostIds.join(',')})`);
    }
  }
  
  const { data, error } = await query
    .select('*')
    .order('date_time', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getUserDatePosts = async (userId: number): Promise<DatePost[]> => {
  const { data, error } = await supabase
    .from('date_posts')
    .select('*')
    .eq('created_by', userId)
    .order('date_time', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getMessages = async (userId: number, otherUserId: number): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getMatches = async (currentUserId: number): Promise<User[]> => {
  const { data, error } = await supabase.rpc('get_user_matches', { 
    current_user_id: currentUserId 
  });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getSwipedLeftIds = async (currentUserId: number): Promise<number[]> => {
  const { data, error } = await supabase
    .from('swipes')
    .select('target_user_id')
    .eq('user_id', currentUserId)
    .eq('swipe_type', 'left');
  
  if (error) handleSupabaseError(error);
  return data?.map(item => item.target_user_id) || [];
};

export const getLocalEvents = async (location?: string): Promise<LocalEvent[]> => {
  let query = supabase
    .from('local_events')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });
  
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  
  const { data, error } = await query;
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getDealsForBusiness = async (businessId: number): Promise<Deal[]> => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

export const getLeaderboard = async (): Promise<(User & { score: number })[]> => {
  const { data, error } = await supabase.rpc('get_leaderboard');
  
  if (error) handleSupabaseError(error);
  return data || [];
};

// Helper function to get current user's session
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  const { data, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) handleSupabaseError(profileError);
  return data || null;
};

// Helper function to upload a file to Supabase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${path}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file);
    
  if (error) handleSupabaseError(error);
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filePath);
    
  return publicUrl;
};

// --- WRITE operations

export const createDate = async (dateData: Omit<DatePost, 'id' | 'created_at' | 'updated_at'>): Promise<DatePost> => {
  const { data, error } = await supabase
    .from('date_posts')
    .insert({
      ...dateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

export const applyForDate = async (userId: number, dateId: number): Promise<void> => {
  const { error } = await supabase
    .from('date_applications')
    .insert({
      user_id: userId,
      date_post_id: dateId,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
  if (error) handleSupabaseError(error);
};

export const sendMessage = async (senderId: number, receiverId: number, text: string): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      text,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

export const markMessagesAsRead = async (userId: number, otherUserId: number): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
    
  if (error) handleSupabaseError(error);
};

export const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

export const updateDatePost = async (dateId: number, updates: Partial<DatePost>): Promise<DatePost> => {
  const { data, error } = await supabase
    .from('date_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', dateId)
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

export const selectDateApplicant = async (dateId: number, userId: number): Promise<void> => {
  const { error } = await supabase.rpc('select_date_applicant', {
    p_date_id: dateId,
    p_user_id: userId
  });
  
  if (error) handleSupabaseError(error);
};

export const deleteDatePost = async (dateId: number): Promise<void> => {
  const { error } = await supabase
    .from('date_posts')
    .delete()
    .eq('id', dateId);
    
  if (error) handleSupabaseError(error);
};

export const recordSwipe = async (userId: number, targetUserId: number, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
  const { data, error } = await supabase.rpc('record_swipe', {
    p_user_id: userId,
    p_target_user_id: targetUserId,
    p_swipe_type: direction
  });
  
  if (error) handleSupabaseError(error);
  return { isMatch: data?.is_match || false };
};

export const recordSuperLike = async (userId: number, targetUserId: number): Promise<{ isMatch: boolean }> => {
  const { data, error } = await supabase.rpc('record_super_like', {
    p_user_id: userId,
    p_target_user_id: targetUserId
  });
  
  if (error) handleSupabaseError(error);
  return { isMatch: data?.is_match || false };
};

export const unmatchUser = async (userId: number, otherUserId: number): Promise<void> => {
  // Delete the match record
  await supabase
    .from('matches')
    .delete()
    .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`);
    
  // Archive messages between users
  await supabase
    .from('messages')
    .update({ is_archived: true })
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);
};

export const reportUser = async (reporterId: number, reportedUserId: number, reason: string): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
  if (error) handleSupabaseError(error);
};

export const blockUser = async (userId: number, blockedUserId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_blocks')
    .insert({
      user_id: userId,
      blocked_user_id: blockedUserId,
      created_at: new Date().toISOString()
    });
    
  if (error) handleSupabaseError(error);
  
  // Also unmatch if they were matched
  await unmatchUser(userId, blockedUserId);
};

// Business-related operations
export const createBusiness = async (businessData: Omit<Business, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Business> => {
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      ...businessData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

export const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at'>): Promise<Deal> => {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...dealData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) handleSupabaseError(error);
  return data;
};

// Real-time subscriptions
export const subscribeToNewMessages = (userId: number, callback: (message: Message) => void) => {
  return supabase
    .channel('messages')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, 
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
};

export const subscribeToProfileUpdates = (userId: number, callback: (user: User) => void) => {
  return supabase
    .channel('user_updates')
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `id=eq.${userId}`
      }, 
      (payload) => {
        callback(payload.new as User);
      }
    )
    .subscribe();
};