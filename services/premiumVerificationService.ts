import { paymentService } from './paymentService';

export interface PremiumVerificationResult {
  isPremium: boolean;
  lastVerified: Date;
  paymentHistory: any[];
}

class PremiumVerificationService {
  private verificationCache = new Map<number, PremiumVerificationResult>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async verifyUserPremiumStatus(userId: number): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.verificationCache.get(userId);
      if (cached && Date.now() - cached.lastVerified.getTime() < this.cacheExpiry) {
        return cached.isPremium;
      }

      // Verify with payment service
      const { payments } = await paymentService.getUserPayments(userId);
      const hasValidPayment = payments.some(payment => 
        payment.status === 'completed' && 
        parseFloat(payment.amount) >= 10.00
      );

      // Update cache
      this.verificationCache.set(userId, {
        isPremium: hasValidPayment,
        lastVerified: new Date(),
        paymentHistory: payments
      });

      return hasValidPayment;
    } catch (error) {
      console.error('Premium verification failed:', error);
      // If verification fails, assume not premium for security
      return false;
    }
  }

  async refreshVerification(userId: number): Promise<boolean> {
    // Force refresh by clearing cache
    this.verificationCache.delete(userId);
    return this.verifyUserPremiumStatus(userId);
  }

  clearCache(userId?: number) {
    if (userId) {
      this.verificationCache.delete(userId);
    } else {
      this.verificationCache.clear();
    }
  }

  // Premium feature guard - use this before allowing premium features
  async requirePremium(userId: number, featureName: string): Promise<void> {
    const isPremium = await this.verifyUserPremiumStatus(userId);
    if (!isPremium) {
      throw new Error(`Premium subscription required to access ${featureName}`);
    }
  }
}

export const premiumVerificationService = new PremiumVerificationService();