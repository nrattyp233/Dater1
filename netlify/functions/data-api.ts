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

async function query(sql: string, params: any[] = []): Promise<any> {
  const response = await fetch(DATABASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: sql,
      params: params
    })
  });

  if (!response.ok) {
    throw new Error(`Database error: ${response.status}`);
  }

  const data = await response.json();
  return data.rows || [];
}

async function getHealthCheck() {
  try {
    // Check JSONBin.io connectivity and bins existence
    const results: any = {
      env: {
        jsonbinMasterKey: !!JSONBIN_MASTER_KEY,
        usersBinId: !!USERS_BIN_ID,
        datesBinId: !!DATES_BIN_ID,
        messagesBinId: !!MESSAGES_BIN_ID,
      }
    };

    try {
      // Test connection to each bin
      const [users, dates, messages] = await Promise.all([
        jsonBinRequest<{ users: User[] }>(USERS_BIN_ID),
        jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID),
        jsonBinRequest<{ messages: Message[] }>(MESSAGES_BIN_ID),
      ]);

      results.usersCount = (users.users || []).length;
      results.datesCount = (dates.dates || []).length;
      results.messagesCount = (messages.messages || []).length;
      results.jsonbinReachable = true;
    } catch (e: any) {
      results.jsonbinReachable = false;
      results.jsonbinError = e?.message || 'unknown';
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

async function seedData() {
  try {
    // Only seed if bins are empty
    const [currentUsers] = await Promise.all([
      jsonBinRequest<{ users: User[] }>(USERS_BIN_ID),
    ]);

    if ((currentUsers.users || []).length > 0) {
      return { message: 'Data already exists, skipping seed' };
    }

    // Sample seed data
    const sampleUsers: User[] = [
      {
        id: 'sample1@example.com',
        name: 'Sample User 1',
        age: 28,
        bio: 'I love trying new restaurants!',
        photos: ['https://example.com/avatar1.jpg'],
        interests: ['food', 'travel'],
        gender: Gender.Male,
        isPremium: false,
        preferences: {
          interestedIn: [Gender.Female],
          ageRange: { min: 25, max: 35 }
        },
        earnedBadgeIds: []
      }
    ];

    const sampleDates: DatePost[] = [
      {
        id: 'date1',
        title: 'Dinner and Movie',
        description: 'Looking for someone to join me for dinner and a movie',
        createdBy: 'sample1@example.com',
        location: 'New York, NY',
        dateTime: new Date().toISOString(),
        applicants: [],
        chosenApplicantId: null,
        categories: ['Food & Drink', 'Relaxing & Casual'],
      }
    ];

    // Update the bins with seed data
    await Promise.all([
      jsonBinRequest(USERS_BIN_ID, 'PUT', { users: sampleUsers }),
      jsonBinRequest(DATES_BIN_ID, 'PUT', { dates: sampleDates }),
      jsonBinRequest(MESSAGES_BIN_ID, 'PUT', { messages: [] }),
    ]);

    return {
      message: 'Seed data created successfully',
      stats: {
        users: sampleUsers.length,
        dates: sampleDates.length,
        messages: 0,
      }
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
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

      if (event.path.includes('/seed')) {
        const seedToken = event.headers['x-seed-token'];
        if (seedToken !== process.env.SEED_TOKEN) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Invalid seed token' })
          };
        }

        const result = await seedData();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      }

      const action = event.path.split('/').pop();
      switch (action) {
        case 'users': {
          const users = await jsonBinRequest<{ users: User[] }>(USERS_BIN_ID);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(users.users || [])
          };
        }
        case 'dates': {
          const dates = await jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(dates.dates || [])
          };
        }
        case 'messages': {
          const messages = await jsonBinRequest<{ messages: Message[] }>(MESSAGES_BIN_ID);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(messages.messages || [])
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
          const dates = await jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID);
          const newDate: DatePost = {
            id: Date.now().toString(),
            title,
            description,
            createdBy,
            location,
            dateTime,
            applicants: [],
            chosenApplicantId: null,
            categories: categories || ['Food & Drink'],
          };
          await jsonBinRequest(DATES_BIN_ID, 'PUT', { 
            dates: [...(dates.dates || []), newDate]
          });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newDate)
          };
        }

        case 'chooseApplicant': {
          const { dateId, applicantId } = payload;
          const dates = await jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID);
          const updatedDates = (dates.dates || []).map(date => 
            date.id === dateId 
              ? { ...date, chosenApplicant: applicantId, status: 'matched' }
              : date
          );
          await jsonBinRequest(DATES_BIN_ID, 'PUT', { dates: updatedDates });
          
          // Create initial message
          const messages = await jsonBinRequest<{ messages: Message[] }>(MESSAGES_BIN_ID);
          const datePost = updatedDates.find(d => d.id === dateId)!;
          const newMessage = {
            id: Date.now().toString(),
            senderId: datePost.createdBy,
            recipientId: applicantId,
            content: 'Hey! I chose you for my date plan! Let\'s discuss the details.',
            datePostId: dateId,
            createdAt: new Date().toISOString()
          };
          await jsonBinRequest(MESSAGES_BIN_ID, 'PUT', {
            messages: [...(messages.messages || []), newMessage]
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(datePost)
          };
        }

        case 'toggleInterest': {
          const { dateId, userId } = payload;
          const dates = await jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID);
          const datePost = (dates.dates || []).find(d => d.id === dateId);
          
          if (!datePost) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Date post not found' })
            };
          }

          const applicants = datePost.applicants || [];
          const exists = applicants.includes(userId);
          const updatedApplicants = exists 
            ? applicants.filter(id => id !== userId)
            : [...applicants, userId];

          const updatedDates = (dates.dates || []).map(date =>
            date.id === dateId
              ? { ...date, applicants: updatedApplicants }
              : date
          );

          await jsonBinRequest(DATES_BIN_ID, 'PUT', { dates: updatedDates });
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(updatedDates.find(d => d.id === dateId))
          };
        }

        case 'updateUser': {
          const userData = payload;
          const users = await jsonBinRequest<{ users: User[] }>(USERS_BIN_ID);
          const updatedUsers = (users.users || []).map(user =>
            user.id === userData.id ? { ...user, ...userData } : user
          );

          if (!updatedUsers.find(u => u.id === userData.id)) {
            updatedUsers.push(userData);
          }

          await jsonBinRequest(USERS_BIN_ID, 'PUT', { users: updatedUsers });
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ ok: true })
          };
        }

        case 'sendMessage': {
          const { senderId, recipientId, content, datePostId } = payload;
          const messages = await jsonBinRequest<{ messages: Message[] }>(MESSAGES_BIN_ID);
          const newMessage = {
            id: Date.now().toString(),
            senderId,
            recipientId,
            content,
            datePostId,
            createdAt: new Date().toISOString()
          };

          await jsonBinRequest(MESSAGES_BIN_ID, 'PUT', {
            messages: [...(messages.messages || []), newMessage]
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newMessage)
          };
        }

        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Unknown action: ${action}` })
          };
      }
    }

    // Handle DELETE requests
    if (event.httpMethod === 'DELETE') {
      if (event.path.includes('/dates/')) {
        const dateId = event.path.split('/').pop();
        const dates = await jsonBinRequest<{ dates: DatePost[] }>(DATES_BIN_ID);
        const updatedDates = (dates.dates || []).filter(date => date.id !== dateId);
        await jsonBinRequest(DATES_BIN_ID, 'PUT', { dates: updatedDates });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ ok: true })
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' })
    };
  } catch (error) {
    console.error('Error handling request:', error);
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