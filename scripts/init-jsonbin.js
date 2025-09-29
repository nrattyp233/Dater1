// Initialize JSONBin.io bins with default data structure
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = process.env.VITE_JSONBIN_MASTER_KEY;

const BINS = {
  USERS: process.env.VITE_USERS_BIN_ID,
  DATES: process.env.VITE_DATES_BIN_ID,
  MESSAGES: process.env.VITE_MESSAGES_BIN_ID,
  PAYMENTS: process.env.VITE_PAYMENTS_BIN_ID
};

async function initializeBin(binId, initialData) {
  try {
    const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
      },
      body: JSON.stringify(initialData)
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize bin ${binId}: ${response.statusText}`);
    }

    console.log(`Successfully initialized bin ${binId}`);
  } catch (error) {
    console.error(`Error initializing bin ${binId}:`, error);
  }
}

async function initializeAllBins() {
  // Initialize users bin
  await initializeBin(BINS.USERS, {
    users: []
  });

  // Initialize dates bin
  await initializeBin(BINS.DATES, {
    dates: []
  });

  // Initialize messages bin
  await initializeBin(BINS.MESSAGES, {
    messages: []
  });

  // Initialize payments bin
  await initializeBin(BINS.PAYMENTS, {
    payments: []
  });
}

initializeAllBins().then(() => {
  console.log('All bins initialized successfully');
}).catch(error => {
  console.error('Failed to initialize bins:', error);
});