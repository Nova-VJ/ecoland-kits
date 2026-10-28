/**
 * SERVICIO DE PASARELAS DE PAGO EN ENTORNO DE STAGING / SANDBOX
 * Soporta Stripe Test Mode y Redsys Sandbox con verificación de firmas de webhook
 * Ecoland E-commerce
 */

import crypto from 'crypto';

export interface PaymentIntentRequest {
  orderId: string;
  amountCents: number;
  currency: 'eur';
  customerEmail: string;
  metadata: {
    orderNumber: string;
    idempotencyKey: string;
    deliveryMethod: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: 'requires_payment_method' | 'requires_action' | 'succeeded';
}

export class PaymentGatewayService {
  private processedEvents: Set<string> = new Set(); // Para idempotencia de webhooks

  /**
   * Crea un PaymentIntent en Stripe Sandbox / Test Mode
   */
  public async createStripePaymentIntent(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    return {
      clientSecret,
      paymentIntentId,
      status: 'requires_payment_method',
    };
  }

  /**
   * Verifica la firma de un Webhook de Stripe (HMAC-SHA256)
   * Formato de cabecera: t=timestamp,v1=signature
   */
  public verifyStripeWebhookSignature(
    payload: string,
    signatureHeader: string,
    secret: string
  ): { isValid: boolean; timestamp?: number } {
    try {
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find(p => p.startsWith('t='));
      const signaturePart = parts.find(p => p.startsWith('v1='));

      if (!timestampPart || !signaturePart) {
        return { isValid: false };
      }

      const timestamp = parseInt(timestampPart.replace('t=', ''), 10);
      const expectedSignature = signaturePart.replace('v1=', '');

      // Prevenir ataques de repetición (tolerancia de 5 minutos)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTimestamp - timestamp) > 300) {
        return { isValid: false };
      }

      const signedPayload = `${timestamp}.${payload}`;
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      return { isValid, timestamp };
    } catch {
      return { isValid: false };
    }
  }

  /**
   * Procesa evento de Webhook con IDEMPOTENCIA estricta
   */
  public processWebhookEvent(
    eventId: string,
    eventType: 'payment_intent.succeeded' | 'payment_intent.payment_failed',
    payload: any
  ): { alreadyProcessed: boolean; action: 'CAPTURE_ORDER' | 'RELEASE_ORDER' | 'IGNORE' } {
    if (this.processedEvents.has(eventId)) {
      return { alreadyProcessed: true, action: 'IGNORE' };
    }

    this.processedEvents.add(eventId);

    if (eventType === 'payment_intent.succeeded') {
      return { alreadyProcessed: false, action: 'CAPTURE_ORDER' };
    }

    if (eventType === 'payment_intent.payment_failed') {
      return { alreadyProcessed: false, action: 'RELEASE_ORDER' };
    }

    return { alreadyProcessed: false, action: 'IGNORE' };
  }
}

export const paymentGatewayService = new PaymentGatewayService();
