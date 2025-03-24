import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
// Import the Stripe SDK
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
  }
  // Create a new payment intent
  async createRefund(paymentIntentId: string, amount: number): Promise<{ refundId: string; amount: number }> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
      });

      return {
        refundId: refund.id,
        amount: amount, // Return original dollar amount
      };
    } catch (error) {
      throw new InternalServerErrorException(`Stripe refund failed: ${error.message}`);
    }
  }
}