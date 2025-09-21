import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
      throw countError;
    }
    
    if (count && count > 0) {
      console.log('Database already seeded, skipping seed data');
      return;
    }

    console.log('Seeding database with initial data...');

    // Seed users
    const users = [
      { id: 1, name: 'Alex', age: 28, bio: 'Software engineer by day, aspiring chef by night. Looking for someone to explore new restaurants with.', photos: ['https://picsum.photos/seed/alex1/400/600','https://picsum.photos/seed/alex2/400/600','https://picsum.photos/seed/alex3/400/600'], interests: ['Cooking','Tech','Hiking'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 24, max: 32 } }, earned_badge_ids: ['starter'] },
      { id: 2, name: 'Brenda', age: 25, bio: 'Graphic designer with a love for all things art and nature. My dog is my best friend.', photos: ['https://picsum.photos/seed/brenda1/400/600','https://picsum.photos/seed/brenda2/400/600'], interests: ['Art','Dogs','Photography'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 35 } }, earned_badge_ids: ['first_date','prolific_planner'] },
      { id: 3, name: 'Carlos', age: 31, bio: 'Fitness enthusiast and personal trainer. I believe a healthy body leads to a healthy mind.', photos: ['https://picsum.photos/seed/carlos1/400/600','https://picsum.photos/seed/carlos2/400/600','https://picsum.photos/seed/carlos3/400/600','https://picsum.photos/seed/carlos4/400/600'], interests: ['Fitness','Nutrition','Travel'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 26, max: 34 } }, earned_badge_ids: ['adventurous'] },
      { id: 4, name: 'Diana', age: 29, bio: 'Musician and bookworm. Can be found at a local concert or curled up with a good book.', photos: ['https://picsum.photos/seed/diana1/400/600','https://picsum.photos/seed/diana2/400/600'], interests: ['Music','Reading','Coffee'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male','female'], ageRange: { min: 27, max: 35 } }, earned_badge_ids: [] },
      { id: 5, name: 'Ethan', age: 27, bio: 'Just a guy who loves to travel and experience new cultures. Where to next?', photos: ['https://picsum.photos/seed/ethan/400/600'], interests: ['Travel','Languages','History'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 23, max: 30 } }, earned_badge_ids: [] },
      { id: 6, name: 'Fiona', age: 26, bio: 'Lover of comedy shows, spicy food, and spontaneous adventures. Let\'s make some memories!', photos: ['https://picsum.photos/seed/fiona1/400/600','https://picsum.photos/seed/fiona2/400/600','https://picsum.photos/seed/fiona3/400/600'], interests: ['Comedy','Foodie','Adventure'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 32 } }, earned_badge_ids: [] },
    ];
    
    const { error: usersError } = await supabase.from('users').insert(users);
    if (usersError) {
      console.error('Error inserting users:', usersError);
      throw usersError;
    }

    const datePosts = [
      { title: 'Stargazing & Picnic', description: 'Let\'s escape the city lights for a bit. I\'ll bring a telescope and some snacks for a relaxing night under the stars. No astronomy knowledge required, just good vibes!', created_by: 2, location: 'Crestview Park', date_time: '2024-08-15T20:00', applicants: [3,5], chosen_applicant_id: null, categories: ['Outdoors & Adventure','Relaxing & Casual'] },
      { title: 'Morning Hike & Coffee', description: 'Join me for a refreshing morning hike on the Sunrise Trail, followed by a well-deserved coffee at The Daily Grind. A great way to start the weekend.', created_by: 3, location: 'Sunrise Trail', date_time: '2024-08-17T08:00', applicants: [2,6], chosen_applicant_id: 2, categories: ['Active & Fitness','Outdoors & Adventure'] },
      { title: 'Indie Band Concert', description: 'The Wandering Echoes are playing downtown! If you\'re into indie rock and live music, this is the spot to be. Let\'s enjoy some great tunes together.', created_by: 4, location: 'The Velvet Underground', date_time: '2024-08-16T21:00', applicants: [], chosen_applicant_id: null, categories: ['Nightlife','Arts & Culture'] },
      { title: 'Cooking class', description: 'Let\'s learn to make pasta from scratch.', created_by: 2, location: 'Downtown', date_time: '2024-08-20T18:00', applicants: [], chosen_applicant_id: null, categories: ['Food & Drink','Arts & Culture'] },
      { title: 'Art gallery tour', description: 'Explore the latest modern art exhibit.', created_by: 2, location: 'City Art Museum', date_time: '2024-08-22T14:00', applicants: [1], chosen_applicant_id: null, categories: ['Arts & Culture'] },
    ];
    
    const { error: datePostsError } = await supabase.from('date_posts').insert(datePosts);
    if (datePostsError) {
      console.error('Error inserting date posts:', datePostsError);
      throw datePostsError;
    }

    const messages = [
      { sender_id: 1, receiver_id: 4, text: 'Hey Diana! I saw we matched. I love your taste in music. Have you heard of The Wandering Echoes?', timestamp: new Date(Date.now()-86400000).toISOString(), read: true },
      { sender_id: 4, receiver_id: 1, text: "Hey Alex! I have, they're great! I'm actually going to their concert soon.", timestamp: new Date(Date.now()-82800000).toISOString(), read: true },
      { sender_id: 1, receiver_id: 4, text: 'No way! Me too. Maybe I\'ll see you there.', timestamp: new Date(Date.now()-79200000).toISOString(), read: false },
      { sender_id: 6, receiver_id: 1, text: 'Hey, we matched!', timestamp: new Date(Date.now()-1800000).toISOString(), read: false },
      { sender_id: 1, receiver_id: 2, text: 'Hi Brenda!', timestamp: new Date(Date.now()-172800000).toISOString(), read: true },
      { sender_id: 1, receiver_id: 2, text: 'Love your art style.', timestamp: new Date(Date.now()-169200000).toISOString(), read: true },
      { sender_id: 1, receiver_id: 6, text: 'Hey Fiona!', timestamp: new Date(Date.now()-7200000).toISOString(), read: true },
      { sender_id: 1, receiver_id: 6, text: "What's your favorite comedy club?", timestamp: new Date(Date.now()-3540000).toISOString(), read: false },
    ];
    
    const { error: messagesError } = await supabase.from('messages').insert(messages);
    if (messagesError) {
      console.error('Error inserting messages:', messagesError);
      throw messagesError;
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    // Don't throw the error to prevent the API from failing completely
    // The app should still work even if seeding fails
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      id: Number(row.id),
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
      id: Number(row.id),
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      text: row.text,
      timestamp: row.timestamp,
      read: row.read,
    });

    switch (action) {
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
        
        const applicants: number[] = current?.applicants ?? [];
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