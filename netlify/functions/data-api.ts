import { Handler } from '@netlify/functions';
import postgres from 'postgres';

// Connect to the database, ensuring SSL is properly configured for Neon
const sql = postgres(process.env.NEON_DATABASE_URL || '', {
    ssl: 'require',
});

// A type-safe router for API actions
const api: { [key: string]: (payload?: any) => Promise<any> } = {
    getUsers: async () => sql`SELECT * FROM users ORDER BY created_at DESC`,
    getUser: async ({ id }) => sql`SELECT * FROM users WHERE id = ${id}`,
    createUser: async ({ user }) => sql`INSERT INTO users ${sql(user)} RETURNING *`,
    updateUser: async ({ id, updates }) => sql`UPDATE users SET ${sql(updates)} WHERE id = ${id} RETURNING *`,
    deleteUser: async ({ id }) => sql`DELETE FROM users WHERE id = ${id}`,

    getDatePosts: async () => sql`SELECT * FROM date_posts ORDER BY created_at DESC`,
    getDatePost: async ({ id }) => sql`SELECT * FROM date_posts WHERE id = ${id}`,
    createDatePost: async ({ post }) => sql`INSERT INTO date_posts ${sql(post)} RETURNING *`,
    updateDatePost: async ({ id, updates }) => sql`UPDATE date_posts SET ${sql(updates)} WHERE id = ${id} RETURNING *`,
    deleteDatePost: async ({ id }) => sql`DELETE FROM date_posts WHERE id = ${id}`,

    getMessages: async () => sql`SELECT * FROM messages ORDER BY timestamp ASC`,
    createMessage: async ({ message }) => sql`INSERT INTO messages ${sql(message)} RETURNING *`,
};

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { action, payload } = JSON.parse(event.body || '{}');

        if (!action || typeof api[action] !== 'function') {
            return { statusCode: 400, body: 'Bad Request: Invalid action' };
        }

        const result = await api[action](payload);

        // For single-item GET requests that find nothing, return 404
        if (action.startsWith('get') && payload?.id && (!result || result.length === 0)) {
            return { statusCode: 404, body: 'Not Found' };
        }

        // For deletions or other actions that might not return data
        if (result === undefined || result === null) {
            return { statusCode: 204, body: '' };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('API Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
