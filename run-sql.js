const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check for the Neon database connection string
const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('❌ Error: NEON_DATABASE_URL environment variable is not set.');
  console.error('Please create a .env file and add your Neon database connection string.');
  process.exit(1);
}

// Configure the connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDatabase() {
  console.log('🚀 Setting up the database...');

  try {
    // Read the SQL setup file
    const sqlFilePath = path.join(__dirname, 'direct-db-setup.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL script from direct-db-setup.sql...');
    
    // Execute the entire script
    await pool.query(sqlScript);

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    // End the pool connection
    await pool.end();
    console.log('Database connection closed.');
  }
}

setupDatabase();