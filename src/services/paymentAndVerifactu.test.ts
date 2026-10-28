import { describe, it, expect } from 'vitest';
import { paymentGatewayService } from './paymentGatewayService';
import { verifactuService } from './verifactuService';
import crypto from 'crypto';

describe('Pasarela de Pago Sandbox y Veri*factu (RD 1619/2012 y RD 1007/2023)', () => {
  it('debe crear un PaymentIntent en Stripe Sandbox con clientSecret válido', async () => {
    const res = await paymentGatewayService.createStripePaymentIntent({
      orderId: 'ord_123',
      amountCents: 4900,
      currency: 'eur',
      customerEmail: 'cliente@example.com',
      metadata: {
        orderNumber: 'ECO-2026-1001',
        idempotencyKey: 'idemp_test_1',
        deliveryMethod: 'domicilio',
      },
    });

    expect(res.paymentIntentId).toContain('pi_test_');
    expect(res.clientSecret).toContain('_secret_');
    expect(res.status).toBe('requires_payment_method');
  });

  it('debe verificar la firma HMAC-SHA256 de webhooks de pago y rechazar manipulaciones', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded' });
    const secret = 'whsec_test_secret_key_12345';
    const timestamp = Math.floor(Date.now() / 1000);

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    const header = `t=${timestamp},v1=${validSignature}`;

    // 1. Firma correcta
    const verifyValid = paymentGatewayService.verifyStripeWebhookSignature(payload, header, secret);
    expect(verifyValid.isValid).toBe(true);

    // 2. Firma manipulada
    const headerTampered = `t=${timestamp},v1=invalid_hex_signature_9999999999999999999999999999999999999999999999999999999999999999`;
    const verifyTampered = paymentGatewayService.verifyStripeWebhookSignature(payload, headerTampered, secret);
    expect(verifyTampered.isValid).toBe(false);
  });

  it('debe gestionar la idempotencia de webhooks repetidos', () => {
    const eventId = 'evt_duplicate_test_1';
    const res1 = paymentGatewayService.processWebhookEvent(eventId, 'payment_intent.succeeded', {});
    expect(res1.alreadyProcessed).toBe(false);
    expect(res1.action).toBe('CAPTURE_ORDER');

    // Mismo webhook recibido por reintento de red
    const res2 = paymentGatewayService.processWebhookEvent(eventId, 'payment_intent.succeeded', {});
    expect(res2.alreadyProcessed).toBe(true);
    expect(res2.action).toBe('IGNORE'); // No ejecuta doble cobro ni doble consolidación
  });

  it('debe encadenar criptográficamente facturas con hash SHA-256 e inmutabilidad (Veri*factu)', () => {
    const invoice1 = verifactuService.issueInvoice({
      orderNumber: 'ECO-2026-101',
      customer: { name: 'Elena García', taxId: '12345678Z' },
      lines: [
        { description: 'Avena Bio 1kg', quantity: 2, unitPrice: 3.50, taxRate: 0.04, totalGross: 7.00 },
        { description: 'Aceite de Oliva 5L', quantity: 1, unitPrice: 42.00, taxRate: 0.10, totalGross: 42.00 }
      ],
      shippingCost: 4.90,
      totalGross: 53.90,
    });

    expect(invoice1.invoiceNumber).toContain('F2026-');
    expect(invoice1.currentRecordHash).toHaveLength(64);
    expect(invoice1.qrPayload).toContain('https://sede.agenciatributaria.gob.es/qr');
    expect(invoice1.qrPayload).toContain(invoice1.invoiceNumber);

    const invoice2 = verifactuService.issueInvoice({
      orderNumber: 'ECO-2026-102',
      customer: { name: 'Marcos Alonso' },
      lines: [
        { description: 'Jabón ecológico', quantity: 1, unitPrice: 6.00, taxRate: 0.21, totalGross: 6.00 }
      ],
      shippingCost: 0.00,
      totalGross: 6.00,
    });

    // Verificación del encadenamiento: el previousRecordHash de la factura 2 DEBE SER el currentRecordHash de la 1
    expect(invoice2.previousRecordHash).toBe(invoice1.currentRecordHash);
    expect(invoice2.currentRecordHash).not.toBe(invoice1.currentRecordHash);
  });

  it('debe generar código QR de cotejo AEAT cumpliendo estrictamente la Orden HAC/1177/2024', () => {
    const qrUrl = verifactuService.generateQrPayload(
      'F2026-000100',
      '2026-10-28T12:00:00.000Z',
      84.50,
      'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
    );

    const parsed = new URL(qrUrl);
    expect(parsed.origin).toBe('https://sede.agenciatributaria.gob.es');
    expect(parsed.pathname).toBe('/qr');
    expect(parsed.searchParams.get('nif')).toBe('B47000001');
    expect(parsed.searchParams.get('num')).toBe('F2026-000100');
    expect(parsed.searchParams.get('fecha')).toBe('2026-10-28');
    expect(parsed.searchParams.get('total')).toBe('84.50');
    expect(parsed.searchParams.get('huella')).toBe('a1b2c3d4');
  });
});
