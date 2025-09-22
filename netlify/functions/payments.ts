import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Helper to get PayPal access token
async function getPayPalAccessToken() {
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
async function createPayPalOrder(amount: string = '10.00') {
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
        },
        description: 'Create-A-Date Premium Subscription'
      }],
      application_context: {
        return_url: `${process.env.URL || 'https://create-a-date.netlify.app'}`,
        cancel_url: `${process.env.URL || 'https://create-a-date.netlify.app'}`,
        brand_name: 'Create-A-Date',
        user_action: 'PAY_NOW'
      }
    })
  });

  return await response.json();
}

// Capture PayPal payment
async function capturePayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

// Verify PayPal payment
async function verifyPayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { action, payload } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing action' }),
      };
    }

    switch (action) {
      case 'createOrder': {
        const { userId } = payload;
        
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing userId' }),
          };
        }

        const order = await createPayPalOrder();
        
        if (order.id) {
          // Store pending payment in database
          await supabase.from('payments').insert({
            user_id: userId,
            paypal_order_id: order.id,
            amount: '10.00',
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ orderId: order.id, links: order.links }),
        };
      }

      case 'captureOrder': {
        const { orderId, userId } = payload;
        
        if (!orderId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing orderId or userId' }),
          };
        }

        // Capture the payment
        const captureResult = await capturePayPalPayment(orderId);
        
        if (captureResult.status === 'COMPLETED') {
          // Update payment status in database
          await supabase.from('payments').update({
            status: 'completed',
            paypal_capture_id: captureResult.id,
            completed_at: new Date().toISOString()
          }).eq('paypal_order_id', orderId);

          // Grant premium access to user
          await supabase.from('users').update({
            is_premium: true,
            premium_activated_at: new Date().toISOString()
          }).eq('id', userId);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              message: 'Payment completed and premium access granted',
              captureId: captureResult.id 
            }),
          };
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Payment capture failed', details: captureResult }),
          };
        }
      }

      case 'verifyPayment': {
        const { orderId, userId } = payload;
        
        if (!orderId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing orderId or userId' }),
          };
        }

        // Verify payment with PayPal
        const paymentDetails = await verifyPayPalPayment(orderId);
        
        // Check our database
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('paypal_order_id', orderId)
          .eq('user_id', userId)
          .single();

        if (payment && payment.status === 'completed' && paymentDetails.status === 'COMPLETED') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ verified: true, payment }),
          };
        } else {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ verified: false }),
          };
        }
      }

      case 'getUserPayments': {
        const { userId } = payload;
        
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing userId' }),
          };
        }

        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ payments }),
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error: any) {
    console.error('Payment API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};