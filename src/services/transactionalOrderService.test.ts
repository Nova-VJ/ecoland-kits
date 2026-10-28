import { describe, it, expect, beforeEach } from 'vitest';
import { transactionalOrderService, CartItemToValidate, CheckoutCustomerInput } from './transactionalOrderService';
import { COMMERCIAL_RULES } from '@/config/commercialRules';

describe('TransactionalOrderService (Backend End-to-End)', () => {
  beforeEach(() => {
    transactionalOrderService.resetState();
  });

  const baseCustomer: CheckoutCustomerInput = {
    name: 'Ana García',
    email: 'ana@example.com',
    phone: '600123456',
    deliveryMethod: 'domicilio',
    shippingAddress: 'Calle Santiago 12',
    shippingCity: 'Valladolid',
    shippingPostalCode: '47001',
    zeroWastePackaging: true,
    plantTree: false
  };

  it('should validate cart items and reject tampered client prices', () => {
    // Tomamos un producto real del catálogo: Copos de Avena Ecosana 500g (erp-4081, precio oficial 1.80€)
    const testItemId = 'erp-4081';
    const actualAvailable = transactionalOrderService.getAvailableStock(testItemId);
    expect(actualAvailable).toBeGreaterThan(0);

    // Intento con precio manipulado por el cliente (0.01€ en vez de 1.80€)
    const tamperedCart: CartItemToValidate[] = [
      {
        id: testItemId,
        type: 'catalog-product',
        quantity: 1,
        clientUnitPrice: 0.01 // PRECIO FALSO MANIPULADO EN EL NAVEGADOR
      }
    ];

    const validation = transactionalOrderService.validateCartItems(tamperedCart);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain('Discrepancia de precio');
  });

  it('should reject order creation if requested quantity exceeds available stock', () => {
    const testItemId = 'erp-4081';
    transactionalOrderService.setPhysicalStock(testItemId, 2); // Solo 2 en tienda

    const overStockCart: CartItemToValidate[] = [
      {
        id: testItemId,
        type: 'catalog-product',
        quantity: 5, // Pide 5 unidades
        clientUnitPrice: 1.80
      }
    ];

    const res = transactionalOrderService.createOrderIntent(baseCustomer, overStockCart, 'key-overstock-1');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Stock insuficiente');
  });

  it('should reserve stock during order intent creation and prevent overselling', () => {
    const testItemId = 'erp-4081';
    transactionalOrderService.setPhysicalStock(testItemId, 3); // 3 unidades en tienda

    // Cliente 1 pide 2 unidades
    const res1 = transactionalOrderService.createOrderIntent(
      baseCustomer,
      [{ id: testItemId, type: 'catalog-product', quantity: 2, clientUnitPrice: 1.80 }],
      'idempotency-key-c1'
    );
    expect(res1.success).toBe(true);

    // Stock disponible restante debe ser 1 (3 físico - 2 reservado)
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(1);

    // Cliente 2 intenta pedir 2 unidades inmediatamente: debe ser rechazado
    const res2 = transactionalOrderService.createOrderIntent(
      { ...baseCustomer, email: 'cliente2@example.com' },
      [{ id: testItemId, type: 'catalog-product', quantity: 2, clientUnitPrice: 1.80 }],
      'idempotency-key-c2'
    );
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('Stock insuficiente');
  });

  it('should enforce idempotency and avoid duplicate orders on duplicate key', () => {
    const cart: CartItemToValidate[] = [
      { id: 'erp-4081', type: 'catalog-product', quantity: 1, clientUnitPrice: 1.80 }
    ];

    const key = 'user-click-uuid-999';
    const res1 = transactionalOrderService.createOrderIntent(baseCustomer, cart, key);
    expect(res1.success).toBe(true);
    const orderNumber1 = res1.order?.orderNumber;

    // Doble clic o reintento de red con la misma clave de idempotencia
    const res2 = transactionalOrderService.createOrderIntent(baseCustomer, cart, key);
    expect(res2.success).toBe(true);
    expect(res2.order?.orderNumber).toBe(orderNumber1);
    expect(res2.order?.id).toBe(res1.order?.id);
  });

  it('should apply 0 shipping for Click and Collect and set store pickup slot', () => {
    const customerPickup: CheckoutCustomerInput = {
      ...baseCustomer,
      deliveryMethod: 'click_and_collect'
    };

    const cart: CartItemToValidate[] = [
      { id: 'erp-4081', type: 'catalog-product', quantity: 1, clientUnitPrice: 1.80 }
    ];

    const res = transactionalOrderService.createOrderIntent(customerPickup, cart, 'key-cc-1');
    expect(res.success).toBe(true);
    expect(res.order?.shippingCost).toBe(0);
    expect(res.order?.pickupSlot?.storeName).toBe(COMMERCIAL_RULES.PHYSICAL_STORE.name);
  });

  it('should execute end-to-end payment confirmation, reduce physical stock and generate invoice', () => {
    const testItemId = 'erp-4081';
    transactionalOrderService.setPhysicalStock(testItemId, 10);

    const cart: CartItemToValidate[] = [
      { id: testItemId, type: 'catalog-product', quantity: 2, clientUnitPrice: 1.80 }
    ];

    // 1. Crear intento
    const intentRes = transactionalOrderService.createOrderIntent(baseCustomer, cart, 'key-pay-success');
    expect(intentRes.success).toBe(true);
    const orderId = intentRes.order!.id;

    expect(intentRes.order!.status).toBe('pending_payment');
    expect(intentRes.order!.invoiceNumber).toBeUndefined();

    // 2. Simular confirmación de pago por webhook de pasarela
    const payRes = transactionalOrderService.processPaymentConfirmation(
      orderId,
      'redsys',
      'txn_redsys_888123',
      true
    );

    expect(payRes.success).toBe(true);
    expect(payRes.order!.status).toBe('paid');
    expect(payRes.order!.invoiceNumber).toContain('FRA-2026-');
    expect(payRes.order!.payment?.status).toBe('captured');

    // 3. Verificar que el stock físico se redujo a 8 y el reservado volvió a 0
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(8);
  });

  it('should release reserved stock when payment is declined/rejected', () => {
    const testItemId = 'erp-4081';
    transactionalOrderService.setPhysicalStock(testItemId, 5);

    const cart: CartItemToValidate[] = [
      { id: testItemId, type: 'catalog-product', quantity: 2, clientUnitPrice: 1.80 }
    ];

    const intentRes = transactionalOrderService.createOrderIntent(baseCustomer, cart, 'key-pay-fail');
    const orderId = intentRes.order!.id;

    // Stock disponible temporalmente baja a 3
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(3);

    // Simular rechazo de tarjeta por el banco
    const payRes = transactionalOrderService.processPaymentConfirmation(
      orderId,
      'stripe',
      'ch_failed_123',
      false // RECHAZADO
    );

    expect(payRes.success).toBe(false);
    expect(payRes.error).toContain('denegada');

    // El stock reservado se libera y el stock disponible vuelve inmediatamente a 5
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(5);
  });

  it('should handle duplicate webhook delivery gracefully without double-reducing stock', () => {
    const testItemId = 'erp-4081';
    transactionalOrderService.setPhysicalStock(testItemId, 10);

    const cart: CartItemToValidate[] = [
      { id: testItemId, type: 'catalog-product', quantity: 3, clientUnitPrice: 1.80 }
    ];

    const intentRes = transactionalOrderService.createOrderIntent(baseCustomer, cart, 'key-webhook-dup');
    const orderId = intentRes.order!.id;

    // Primer webhook
    const pay1 = transactionalOrderService.processPaymentConfirmation(orderId, 'stripe', 'pi_success_1', true);
    expect(pay1.success).toBe(true);
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(7);

    // Segundo webhook repetido por reintento de la pasarela
    const pay2 = transactionalOrderService.processPaymentConfirmation(orderId, 'stripe', 'pi_success_1', true);
    expect(pay2.success).toBe(true);
    // El stock NO debe reducirse de nuevo a 4; debe permanecer en 7
    expect(transactionalOrderService.getAvailableStock(testItemId)).toBe(7);
  });
});
