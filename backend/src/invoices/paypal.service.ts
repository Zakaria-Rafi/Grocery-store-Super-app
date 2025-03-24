import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
// Import the PayPal SDK
@Injectable()
export class PayPalService {
  private paypalClient: paypal.core.PayPalHttpClient;
  // Create a new PayPal client
  constructor() {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }
  // Create a new order with the specified amount
  async createRefund(orderId: string, amount: number): Promise<string> {
    const request = new paypal.payments.CapturesRefundRequest(orderId);
    request.requestBody({
      amount: {
        currency_code: 'USD',
        value: amount.toString(),
      }
    });
    // Execute the request and return the order ID
    const response = await this.paypalClient.execute(request);
    return response.result.id;
  }
  
}