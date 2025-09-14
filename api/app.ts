import { sql } from '@vercel/postgres';

type Req = any;
type Res = any;

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    bio TEXT,
    photos JSONB,
    interests JSONB,
    gender TEXT,
    is_premium BOOLEAN,
    preferences JSONB,
    earned_badge_ids JSONB
  )`;
  await sql`CREATE TABLE IF NOT EXISTS date_posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    location TEXT,
    date_time TEXT,
    applicants JSONB,
    chosen_applicant_id INTEGER,
    categories JSONB
  )`;
  await sql`CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    text TEXT,
    timestamp TEXT,
    read BOOLEAN
  )`;
}

async function seedIfEmpty() {
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (rows[0]?.count > 0) return;

  // Seed users
  const users = [
    { id: 1, name: 'Alex', age: 28, bio: 'Software engineer by day, aspiring chef by night. Looking for someone to explore new restaurants with.', photos: ['https://picsum.photos/seed/alex1/400/600','https://picsum.photos/seed/alex2/400/600','https://picsum.photos/seed/alex3/400/600'], interests: ['Cooking','Tech','Hiking'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 24, max: 32 } }, earned_badge_ids: ['starter'] },
    { id: 2, name: 'Brenda', age: 25, bio: 'Graphic designer with a love for all things art and nature. My dog is my best friend.', photos: ['https://picsum.photos/seed/brenda1/400/600','https://picsum.photos/seed/brenda2/400/600'], interests: ['Art','Dogs','Photography'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 35 } }, earned_badge_ids: ['first_date','prolific_planner'] },
    { id: 3, name: 'Carlos', age: 31, bio: 'Fitness enthusiast and personal trainer. I believe a healthy body leads to a healthy mind.', photos: ['https://picsum.photos/seed/carlos1/400/600','https://picsum.photos/seed/carlos2/400/600','https://picsum.photos/seed/carlos3/400/600','https://picsum.photos/seed/carlos4/400/600'], interests: ['Fitness','Nutrition','Travel'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 26, max: 34 } }, earned_badge_ids: ['adventurous'] },
    { id: 4, name: 'Diana', age: 29, bio: 'Musician and bookworm. Can be found at a local concert or curled up with a good book.', photos: ['https://picsum.photos/seed/diana1/400/600','https://picsum.photos/seed/diana2/400/600'], interests: ['Music','Reading','Coffee'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male','female'], ageRange: { min: 27, max: 35 } }, earned_badge_ids: [] },
    { id: 5, name: 'Ethan', age: 27, bio: 'Just a guy who loves to travel and experience new cultures. Where to next?', photos: ['https://picsum.photos/seed/ethan/400/600'], interests: ['Travel','Languages','History'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 23, max: 30 } }, earned_badge_ids: [] },
    { id: 6, name: 'Fiona', age: 26, bio: 'Lover of comedy shows, spicy food, and spontaneous adventures. Let\'s make some memories!', photos: ['https://picsum.photos/seed/fiona1/400/600','https://picsum.photos/seed/fiona2/400/600','https://picsum.photos/seed/fiona3/400/600'], interests: ['Comedy','Foodie','Adventure'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 32 } }, earned_badge_ids: [] },
  ];
  for (const u of users) {
    await sql`INSERT INTO users (id,name,age,bio,photos,interests,gender,is_premium,preferences,earned_badge_ids)
      VALUES (${u.id}, ${u.name}, ${u.age}, ${u.bio}, ${JSON.stringify(u.photos)}::jsonb, ${JSON.stringify(u.interests)}::jsonb, ${u.gender}, ${u.is_premium}, ${JSON.stringify(u.preferences)}::jsonb, ${JSON.stringify(u.earned_badge_ids)}::jsonb)`;
  }

  const datePosts = [
    { title: 'Stargazing & Picnic', description: 'Let\'s escape the city lights for a bit. I\'ll bring a telescope and some snacks for a relaxing night under the stars. No astronomy knowledge required, just good vibes!', created_by: 2, location: 'Crestview Park', date_time: '2024-08-15T20:00', applicants: [3,5], chosen_applicant_id: null, categories: ['Outdoors & Adventure','Relaxing & Casual'] },
    { title: 'Morning Hike & Coffee', description: 'Join me for a refreshing morning hike on the Sunrise Trail, followed by a well-deserved coffee at The Daily Grind. A great way to start the weekend.', created_by: 3, location: 'Sunrise Trail', date_time: '2024-08-17T08:00', applicants: [2,6], chosen_applicant_id: 2, categories: ['Active & Fitness','Outdoors & Adventure'] },
    { title: 'Indie Band Concert', description: 'The Wandering Echoes are playing downtown! If you\'re into indie rock and live music, this is the spot to be. Let\'s enjoy some great tunes together.', created_by: 4, location: 'The Velvet Underground', date_time: '2024-08-16T21:00', applicants: [], chosen_applicant_id: null, categories: ['Nightlife','Arts & Culture'] },
    { title: 'Cooking class', description: 'Let\'s learn to make pasta from scratch.', created_by: 2, location: 'Downtown', date_time: '2024-08-20T18:00', applicants: [], chosen_applicant_id: null, categories: ['Food & Drink','Arts & Culture'] },
    { title: 'Art gallery tour', description: 'Explore the latest modern art exhibit.', created_by: 2, location: 'City Art Museum', date_time: '2024-08-22T14:00', applicants: [1], chosen_applicant_id: null, categories: ['Arts & Culture'] },
  ];
  for (const d of datePosts) {
    await sql`INSERT INTO date_posts (title,description,created_by,location,date_time,applicants,chosen_applicant_id,categories)
      VALUES (${d.title}, ${d.description}, ${d.created_by}, ${d.location}, ${d.date_time}, ${JSON.stringify(d.applicants)}::jsonb, ${d.chosen_applicant_id}, ${JSON.stringify(d.categories)}::jsonb)`;
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
  for (const m of messages) {
    await sql`INSERT INTO messages (sender_id,receiver_id,text,timestamp,read)
      VALUES (${m.sender_id}, ${m.receiver_id}, ${m.text}, ${m.timestamp}, ${m.read})`;
  }
}

export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }
    await ensureSchema();
    await seedIfEmpty();

    const { action, payload } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!action) {
      res.status(400).json({ error: 'Missing action' });
      return;
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
      case 'getUsers': {
        const { rows } = await sql`SELECT * FROM users ORDER BY id ASC`;
        res.json(rows.map(mapUser));
        return;
      }
      case 'getDatePosts': {
        const { rows } = await sql`SELECT * FROM date_posts ORDER BY id DESC`;
        res.json(rows.map(mapDatePost));
        return;
      }
      case 'getMessages': {
        const { rows } = await sql`SELECT * FROM messages ORDER BY id ASC`;
        res.json(rows.map(mapMessage));
        return;
      }
      case 'createDate': {
        const d = payload;
        const { rows } = await sql`INSERT INTO date_posts (title,description,created_by,location,date_time,applicants,chosen_applicant_id,categories)
          VALUES (${d.title}, ${d.description}, ${d.createdBy}, ${d.location}, ${d.dateTime}, '[]'::jsonb, NULL, ${JSON.stringify(d.categories ?? [])}::jsonb)
          RETURNING *`;
        res.json(mapDatePost(rows[0]));
        return;
      }
      case 'deleteDate': {
        const { id } = payload;
        await sql`DELETE FROM date_posts WHERE id=${id}`;
        res.json({ ok: true });
        return;
      }
      case 'chooseApplicant': {
        const { dateId, applicantId } = payload;
        const { rows } = await sql`UPDATE date_posts SET chosen_applicant_id=${applicantId} WHERE id=${dateId} RETURNING *`;
        res.json(mapDatePost(rows[0]));
        return;
      }
      case 'toggleInterest': {
        const { dateId, userId } = payload;
        const { rows } = await sql`SELECT applicants FROM date_posts WHERE id=${dateId}`;
        const applicants: number[] = rows[0]?.applicants ?? [];
        const exists = applicants.includes(userId);
        const next = exists ? applicants.filter((x) => x !== userId) : [...applicants, userId];
        const updated = await sql`UPDATE date_posts SET applicants=${JSON.stringify(next)}::jsonb WHERE id=${dateId} RETURNING *`;
        res.json(mapDatePost(updated.rows[0]));
        return;
      }
      case 'updateUser': {
        const u = payload;
        await sql`INSERT INTO users (id,name,age,bio,photos,interests,gender,is_premium,preferences,earned_badge_ids)
          VALUES (${u.id}, ${u.name}, ${u.age}, ${u.bio}, ${JSON.stringify(u.photos)}::jsonb, ${JSON.stringify(u.interests)}::jsonb, ${u.gender}, ${u.isPremium}, ${JSON.stringify(u.preferences)}::jsonb, ${JSON.stringify(u.earnedBadgeIds ?? [])}::jsonb)
          ON CONFLICT (id) DO UPDATE SET
            name=EXCLUDED.name,
            age=EXCLUDED.age,
            bio=EXCLUDED.bio,
            photos=EXCLUDED.photos,
            interests=EXCLUDED.interests,
            gender=EXCLUDED.gender,
            is_premium=EXCLUDED.is_premium,
            preferences=EXCLUDED.preferences,
            earned_badge_ids=EXCLUDED.earned_badge_ids`;
        res.json({ ok: true });
        return;
      }
      case 'sendMessage': {
        const { senderId, receiverId, text } = payload;
        const now = new Date().toISOString();
        const { rows } = await sql`INSERT INTO messages (sender_id,receiver_id,text,timestamp,read)
          VALUES (${senderId}, ${receiverId}, ${text}, ${now}, false) RETURNING *`;
        res.json(mapMessage(rows[0]));
        return;
      }
      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
        return;
    }
  } catch (err: any) {
    console.error('Data API error:', err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}
