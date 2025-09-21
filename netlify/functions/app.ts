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