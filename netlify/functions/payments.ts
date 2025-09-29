import { Handler } from '@netlify/functions';
import type { UserPayment } from '../../services/paymentService';

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_MASTER_KEY = process.env.VITE_JSONBIN_MASTER_KEY!;
const PAYMENTS_BIN_ID = process.env.VITE_PAYMENTS_BIN_ID!;
const USERS_BIN_ID = process.env.VITE_USERS_BIN_ID!;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Helper function to interact with JSONBin.io
async function jsonBinRequest<T>(binId: string, method: 'GET' | 'PUT' = 'GET', body?: any): Promise<T> {
  const url = `${JSONBIN_API_URL}/${binId}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_MASTER_KEY,
      'X-Bin-Meta': 'false'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    throw new Error(`JSONBin API error: ${response.status}`);
  }

  const data = await response.json();
  return method === 'GET' ? data : data.record;
}

// Helper to get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
async function createPayPalOrder(amount: string = '10.00'): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount
        }
      }],
      application_context: {
        return_url: `${process.env.URL || 'https://create-a-date.netlify.app'}`,
        cancel_url: `${process.env.URL || 'https://create-a-date.netlify.app'}`
      }
    }),
  });

  return response.json();
}

// Capture PayPal payment
async function capturePayment(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const { action, userId, orderId, amount } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'create-order': {
        const order = await createPayPalOrder(amount);
        if (order.id) {
          // Store payment record in JSONBin
          const { payments = [] } = await jsonBinRequest<{ payments: UserPayment[] }>(PAYMENTS_BIN_ID);
          const newPayment: UserPayment = {
            id: Date.now().toString(),
            user_id: userId,
            paypal_order_id: order.id,
            amount,
            status: 'pending',
            created_at: new Date().toISOString()
          };

          await jsonBinRequest(PAYMENTS_BIN_ID, 'PUT', { 
            payments: [...payments, newPayment] 
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order)
          };
        }
        throw new Error('Failed to create PayPal order');
      }

      case 'capture-payment': {
        const captureData = await capturePayment(orderId);
        if (captureData.status === 'COMPLETED') {
          // Update payment record
          const { payments = [] } = await jsonBinRequest<{ payments: UserPayment[] }>(PAYMENTS_BIN_ID);
          const paymentIndex = payments.findIndex(p => p.paypal_order_id === orderId);
          
          if (paymentIndex >= 0) {
            payments[paymentIndex] = {
              ...payments[paymentIndex],
              status: 'completed',
              paypal_capture_id: captureData.purchase_units[0].payments.captures[0].id,
              completed_at: new Date().toISOString()
            };

            await jsonBinRequest(PAYMENTS_BIN_ID, 'PUT', { payments });

            // Update user's premium status
            const { users = [] } = await jsonBinRequest<{ users: any[] }>(USERS_BIN_ID);
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex >= 0) {
              users[userIndex] = {
                ...users[userIndex],
                isPremium: true
              };

              await jsonBinRequest(USERS_BIN_ID, 'PUT', { users });
            }
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(captureData)
          };
        }
        throw new Error('Payment capture failed');
      }

      case 'verify-payment': {
        // Get payment record
        const { payments = [] } = await jsonBinRequest<{ payments: UserPayment[] }>(PAYMENTS_BIN_ID);
        const payment = payments.find(p => p.paypal_order_id === orderId);

        if (payment?.status === 'completed') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ verified: true, payment })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ verified: false })
        };
      }

      case 'get-user-payments': {
        // Get all payments for user
        const { payments = [] } = await jsonBinRequest<{ payments: UserPayment[] }>(PAYMENTS_BIN_ID);
        const userPayments = payments.filter(p => p.user_id === userId);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(userPayments)
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Payment processing failed' })
    };
  }
};
