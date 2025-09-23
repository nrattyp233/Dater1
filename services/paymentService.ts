// Payment service for PayPal integration
export interface PaymentOrder {
  orderId: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PaymentCapture {
  success: boolean;
  message: string;
  captureId?: string;
}

export interface PaymentVerification {
  verified: boolean;
  payment?: any;
}

export interface UserPayment {
  id: string;
  user_id: string; // Changed to string to match User.id
  paypal_order_id: string;
  paypal_capture_id?: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://create-a-date.netlify.app/.netlify/functions' 
      : '/.netlify/functions';
  }

  private async request(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment request failed');
    }

    return response.json();
  }

  async createOrder(userId: number): Promise<PaymentOrder> {
    return this.request('payments', {
      action: 'createOrder',
      payload: { userId }
    });
  }

  async captureOrder(orderId: string, userId: number): Promise<PaymentCapture> {
    return this.request('payments', {
      action: 'captureOrder',
      payload: { orderId, userId }
    });
  }

  async verifyPayment(orderId: string, userId: number): Promise<PaymentVerification> {
    return this.request('payments', {
      action: 'verifyPayment',
      payload: { orderId, userId }
    });
  }

  async getUserPayments(userId: string): Promise<{ payments: UserPayment[] }> {
    return this.request('payments', {
      action: 'getUserPayments',
      payload: { userId }
    });
  }
}

export const paymentService = new PaymentService();