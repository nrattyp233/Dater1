import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Gender } from '../../types';
import type { User, DatePost, Message } from '../../types';

const DATABASE_URL = process.env.DATABASE_URL!;

const headers = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Seed-Token',
  'Content-Type': 'application/json'
};

// Simple database query function for Neon
async function dbQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    // For Neon, we can use a simple HTTP API approach
    const response = await fetch(`${DATABASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEON_API_KEY || ''}`,
      },
      body: JSON.stringify({
        query: sql,
        params: params
      })
    });

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.status}`);
    }

    const data = await response.json();
    return data.rows || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function getHealthCheck() {
  try {
    const results: any = {
      env: {
        databaseUrl: !!DATABASE_URL,
      }
    };

    try {
      // Test database connection
      const users = await dbQuery('SELECT COUNT(*) as count FROM users');
      const dates = await dbQuery('SELECT COUNT(*) as count FROM date_posts');
      const messages = await dbQuery('SELECT COUNT(*) as count FROM messages');

      results.usersCount = users[0]?.count || 0;
      results.datesCount = dates[0]?.count || 0;
      results.messagesCount = messages[0]?.count || 0;
      results.databaseReachable = true;
    } catch (e: any) {
      results.databaseReachable = false;
      results.databaseError = e?.message || 'unknown';
    }

    return results;
  } catch (error) {
    console.error('Error in health check:', error);
    return {
      error: 'Failed to complete health check',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      if (event.path.includes('/health')) {
        const health = await getHealthCheck();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(health)
        };
      }

      const action = event.path.split('/').pop();
      switch (action) {
        case 'users': {
          const users = await dbQuery(`
            SELECT id, name, age, bio, photos, interests, gender, is_premium, preferences, earned_badge_ids
            FROM users 
            ORDER BY created_at DESC
          `);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(users)
          };
        }
        case 'dates': {
          const dates = await dbQuery(`
            SELECT id, title, description, created_by, location, date_time, applicants, chosen_applicant_id, categories
            FROM date_posts 
            ORDER BY created_at DESC
          `);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(dates)
          };
        }
        case 'messages': {
          const messages = await dbQuery(`
            SELECT id, sender_id, receiver_id, text, timestamp, read
            FROM messages 
            ORDER BY timestamp DESC
          `);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(messages)
          };
        }
      }
    }

    // Handle POST requests
    if (event.httpMethod === 'POST') {
      const { action, payload } = JSON.parse(event.body || '{}');

      switch (action) {
        case 'createDate': {
          const { title, description, createdBy, location, dateTime, categories } = payload;
          const result = await dbQuery(`
            INSERT INTO date_posts (title, description, created_by, location, date_time, categories)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `, [title, description, createdBy, location, dateTime, JSON.stringify(categories)]);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result[0])
          };
        }
        case 'createUser': {
          const { id, name, age, bio, photos, interests, gender, preferences } = payload;
          const result = await dbQuery(`
            INSERT INTO users (id, name, age, bio, photos, interests, gender, preferences)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              age = EXCLUDED.age,
              bio = EXCLUDED.bio,
              photos = EXCLUDED.photos,
              interests = EXCLUDED.interests,
              gender = EXCLUDED.gender,
              preferences = EXCLUDED.preferences,
              updated_at = NOW()
            RETURNING *
          `, [id, name, age, bio, JSON.stringify(photos), JSON.stringify(interests), gender, JSON.stringify(preferences)]);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result[0])
          };
        }
        case 'sendMessage': {
          const { senderId, receiverId, text, timestamp } = payload;
          const result = await dbQuery(`
            INSERT INTO messages (sender_id, receiver_id, text, timestamp)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [senderId, receiverId, text, timestamp]);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result[0])
          };
        }
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
