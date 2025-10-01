import { Handler } from '@netlify/functions';
import postgres from 'postgres';
import type { UserPayment } from '../../services/paymentService';

// Connect to the database
const sql = postgres(process.env.NEON_DATABASE_URL || '', {
    ssl: 'require',
});

// Secure CORS headers
const headers = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://create-a-date.netlify.app',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

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

    // Input validation
    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' })
      };
    }

    switch (action) {
      case 'create-order': {
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'userId is required' })
          };
        }

        const order = await createPayPalOrder(amount || '10.00');
        if (order.id) {
          // Store payment record in NeonDB
          const newPayment = {
            user_id: userId,
            paypal_order_id: order.id,
            amount: parseFloat(amount || '10.00'),
            status: 'pending',
          };

          await sql`INSERT INTO payments ${sql(newPayment)}`;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ orderId: order.id, links: order.links })
          };
        }
        throw new Error('Failed to create PayPal order');
      }

      case 'capture-payment': {
        if (!orderId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'orderId and userId are required' })
          };
        }

        const captureData = await capturePayment(orderId);
        if (captureData.status === 'COMPLETED') {
          // Update payment record in NeonDB
          const captureId = captureData.purchase_units[0].payments.captures[0].id;
          
          await sql`UPDATE payments SET status = 'completed', paypal_capture_id = ${captureId}, completed_at = NOW() WHERE paypal_order_id = ${orderId}`;

          // Update user's premium status
          await sql`UPDATE users SET is_premium = true, premium_activated_at = NOW() WHERE id = ${userId}`;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Payment completed', captureId })
          };
        }
        throw new Error('Payment capture failed');
      }

      case 'verify-payment': {
        if (!orderId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'orderId is required' })
          };
        }

        // Get payment record from NeonDB
        const payment = await sql`SELECT * FROM payments WHERE paypal_order_id = ${orderId}`;

        if (payment.length > 0 && payment[0].status === 'completed') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ verified: true, payment: payment[0] })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ verified: false })
        };
      }

      case 'get-user-payments': {
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'userId is required' })
          };
        }

        // Get all payments for user from NeonDB
        const payments = await sql`SELECT * FROM payments WHERE user_id = ${userId} ORDER BY created_at DESC`;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ payments })
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
      body: JSON.stringify({ error: error.message || 'Payment processing failed' })
    };
  }
};
