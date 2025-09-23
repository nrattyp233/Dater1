import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (anon)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Create an admin client if a service role key is provided
const getAdminClient = () => {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(url, serviceKey);
};

async function ensureSchema() {
  // Note: In Supabase, you typically create tables via the dashboard or SQL editor
  // This is kept for reference but won't actually create tables
  console.log('Tables should be created in Supabase dashboard');
}

async function seedIfEmpty() {
  try {
    // Check if users table has data
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking user count:', countError);
      // Don't throw error - just log it and continue
      console.log('Tables likely don\'t exist yet or there\'s a connection issue');
      return;
    }
    
    if (count && count > 0) {
      console.log(`Database already has ${count} users, skipping seed data`);
      return;
    }

    console.log('Database appears empty, but this should be seeded via SQL script');
    // No automatic seeding - production data should come from SQL script
    return;
  } catch (error) {
    console.error('Error during seeding check:', error);
    // Don't throw the error to prevent the API from failing completely
    // The app should still work even if seeding fails
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Seed-Token',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, service: 'data-api' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await ensureSchema();
    await seedIfEmpty();

    const { action, payload } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing action' }),
      };
    }

    // Helpers
    const mapUser = (row: any) => ({
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
    });

    const mapDatePost = (row: any) => ({
      id: String(row.id), // Convert to string
      title: row.title,
      description: row.description,
      createdBy: row.created_by,
      location: row.location,
      dateTime: row.date_time,
      applicants: row.applicants ?? [],
      chosenApplicantId: row.chosen_applicant_id,
      categories: row.categories ?? [],
    });

    const mapMessage = (row: any) => ({
      id: String(row.id), // Convert to string
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      text: row.text,
      timestamp: row.timestamp,
      read: row.read,
    });

    switch (action) {
  case 'health': {
        // Report basic connectivity and counts (anon client)
        const results: any = {
          ok: true,
          env: {
            supabaseUrl: !!process.env.SUPABASE_URL,
            supabaseAnon: !!process.env.SUPABASE_ANON_KEY,
            node: process.version,
            region: process.env.AWS_REGION || process.env.NF_REGION || null
          }
        };
        try {
          const { count: usersCount, error: uErr } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
          results.usersCount = usersCount ?? 0;
          if (uErr) results.usersError = uErr.message;
        } catch (e: any) {
          results.usersError = e?.message || 'unknown';
        }
        // Outbound reachability tests
        try {
          const pong = await fetch('https://api.ipify.org?format=json', { method: 'GET' });
          results.egress = pong.ok;
        } catch (e: any) {
          results.egress = false;
          results.egressError = e?.message || 'unknown';
        }
        try {
          const supaPing = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_ANON_KEY}`, { method: 'GET' });
          results.supabaseReachable = supaPing.ok || supaPing.status === 404;
          results.supabaseStatus = supaPing.status;
        } catch (e: any) {
          results.supabaseReachable = false;
          results.supabaseReachError = e?.message || 'unknown';
        }
        try {
          const { count: postsCount, error: pErr } = await supabase
            .from('date_posts')
            .select('*', { count: 'exact', head: true });
          results.datePostsCount = postsCount ?? 0;
          if (pErr) results.datePostsError = pErr.message;
        } catch (e: any) {
          results.datePostsError = e?.message || 'unknown';
        }
        try {
          const { count: messagesCount, error: mErr } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true });
          results.messagesCount = messagesCount ?? 0;
          if (mErr) results.messagesError = mErr.message;
        } catch (e: any) {
          results.messagesError = e?.message || 'unknown';
        }
        return { statusCode: 200, headers, body: JSON.stringify(results) };
      }
      case 'seedProduction': {
        // Guarded seed endpoint: requires SEED_ENABLED=true and correct token
        if (process.env.SEED_ENABLED !== 'true') {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Seeding disabled' }) };
        }
        const tokenFromHeader = event.headers['x-seed-token'] || event.headers['X-Seed-Token'];
        const tokenFromPayload = payload?.token;
        const expected = process.env.SEED_TOKEN;
        if (!expected || (tokenFromHeader !== expected && tokenFromPayload !== expected)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Use regular anon client for seeding (skip service role requirement)
        const seedClient = supabase;

        // If users already exist, skip
        const { count: userCount, error: userCountErr } = await seedClient
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (userCountErr) {
          console.error('User count check failed:', userCountErr);
          // Continue anyway - tables might not exist yet
        }
        if ((userCount ?? 0) > 0) {
          return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Users already present, skipping seed', userCount }) };
        }

        // Seed users (id 1..5)
        const usersToInsert = [
          { id: '1', name: 'Alex Jordan', age: 28, bio: "Software engineer who loves building amazing apps. Always up for a coffee chat about tech or life!", photos: ["https://picsum.photos/seed/alex1/400/600","https://picsum.photos/seed/alex2/400/600"], interests: ["Technology","Coffee","Fitness","Travel"], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 24, max: 35 } }, earned_badge_ids: [] },
          { id: '2', name: 'Maya Chen', age: 26, bio: 'UX designer passionate about creating beautiful experiences. Dog mom to a golden retriever named Pixel!', photos: ["https://picsum.photos/seed/maya1/400/600","https://picsum.photos/seed/maya2/400/600"], interests: ["Design","Dogs","Art","Hiking"], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 32 } }, earned_badge_ids: [] },
          { id: '3', name: 'Jordan Rivera', age: 30, bio: 'Entrepreneur building the next big thing. Love adventure sports and trying new cuisines!', photos: ["https://picsum.photos/seed/jordan1/400/600","https://picsum.photos/seed/jordan2/400/600"], interests: ["Business","Adventure","Food","Networking"], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 26, max: 34 } }, earned_badge_ids: [] },
          { id: '4', name: 'Sophia Kim', age: 27, bio: 'Marketing manager by day, yoga instructor by evening. Always looking for the next great date idea!', photos: ["https://picsum.photos/seed/sophia1/400/600","https://picsum.photos/seed/sophia2/400/600"], interests: ["Marketing","Yoga","Wellness","Music"], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 27, max: 35 } }, earned_badge_ids: [] },
          { id: '5', name: 'Marcus Thompson', age: 29, bio: "Personal trainer who believes in living life to the fullest. Let's explore the city together!", photos: ["https://picsum.photos/seed/marcus1/400/600","https://picsum.photos/seed/marcus2/400/600"], interests: ["Fitness","Sports","Outdoors","Photography"], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 24, max: 32 } }, earned_badge_ids: [] },
        ];

        const { error: usersInsertErr } = await seedClient.from('users').upsert(usersToInsert, { onConflict: 'id' });
        if (usersInsertErr) {
          console.error('Users insert failed:', usersInsertErr);
          return { statusCode: 500, headers, body: JSON.stringify({ error: usersInsertErr.message }) };
        }

        // Seed date posts
        const datePostsToInsert = [
          { id: '1', title: 'Coffee & Code Chat', description: "Let's grab coffee and talk about our favorite projects! Perfect for fellow tech enthusiasts.", created_by: '1', location: 'Downtown Tech Cafe', date_time: '2024-12-30T15:00:00Z', applicants: [], chosen_applicant_id: null, categories: ['Food & Drink'] },
          { id: '2', title: 'Sunset Yoga Session', description: 'Join me for a relaxing yoga session at the park as the sun sets. All levels welcome!', created_by: '4', location: 'Central Park Pavilion', date_time: '2024-12-28T17:30:00Z', applicants: [], chosen_applicant_id: null, categories: ['Active & Fitness', 'Relaxing & Casual'] },
          { id: '3', title: 'Food Truck Adventure', description: "Let's explore the city's best food trucks and try something new! Perfect for foodies.", created_by: '3', location: 'Food Truck Plaza', date_time: '2024-12-29T12:00:00Z', applicants: [], chosen_applicant_id: null, categories: ['Food & Drink', 'Adventure'] },
        ];
        const { error: postsInsertErr } = await seedClient.from('date_posts').upsert(datePostsToInsert as any, { onConflict: 'id' });
        if (postsInsertErr) {
          console.error('Posts insert failed:', postsInsertErr);
          return { statusCode: 500, headers, body: JSON.stringify({ error: postsInsertErr.message }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, users: usersToInsert.length, datePosts: datePostsToInsert.length }) };
      }
      case 'getUsers':
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .order('id', { ascending: true });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(users?.map(mapUser) || []),
        };
      case 'getDatePosts':
        const { data: datePosts } = await supabase
          .from('date_posts')
          .select('*')
          .order('id', { ascending: false });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(datePosts?.map(mapDatePost) || []),
        };
      case 'getMessages':
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .order('id', { ascending: true });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(messages?.map(mapMessage) || []),
        };
      case 'createDate': {
        const { title, description, createdBy, location, dateTime, categories } = payload;
        const { data: created } = await supabase
          .from('date_posts')
          .insert({
            title,
            description,
            created_by: createdBy,
            location,
            date_time: dateTime,
            applicants: [],
            chosen_applicant_id: null,
            categories
          })
          .select()
          .single();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mapDatePost(created)),
        };
      }
      case 'deleteDate': {
        const { id } = payload;
        await supabase.from('date_posts').delete().eq('id', id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ ok: true }),
        };
      }
      case 'chooseApplicant': {
        const { dateId, applicantId } = payload;
        const { data: updated } = await supabase
          .from('date_posts')
          .update({ chosen_applicant_id: applicantId })
          .eq('id', dateId)
          .select()
          .single();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mapDatePost(updated)),
        };
      }
      case 'toggleInterest': {
        const { dateId, userId } = payload;
        const { data: current } = await supabase
          .from('date_posts')
          .select('applicants')
          .eq('id', dateId)
          .single();
        
        const applicants: string[] = current?.applicants ?? []; // Changed to string array
        const exists = applicants.includes(userId);
        const next = exists ? applicants.filter((x) => x !== userId) : [...applicants, userId];
        
        const { data: updated } = await supabase
          .from('date_posts')
          .update({ applicants: next })
          .eq('id', dateId)
          .select()
          .single();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mapDatePost(updated)),
        };
      }
      case 'updateUser': {
        const u = payload;
        await supabase
          .from('users')
          .upsert({
            id: u.id,
            name: u.name,
            age: u.age,
            bio: u.bio,
            photos: u.photos,
            interests: u.interests,
            gender: u.gender,
            is_premium: u.isPremium,
            preferences: u.preferences,
            earned_badge_ids: u.earnedBadgeIds ?? []
          });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ ok: true }),
        };
      }
      case 'sendMessage': {
        const { senderId, receiverId, text } = payload;
        const now = new Date().toISOString();
        const { data: result } = await supabase
          .from('messages')
          .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            text,
            timestamp: now,
            read: false
          })
          .select()
          .single();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mapMessage(result)),
        };
      }
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` }),
        };
    }
  } catch (err: any) {
    console.error('Data API error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || 'Server error' }),
    };
  }
};