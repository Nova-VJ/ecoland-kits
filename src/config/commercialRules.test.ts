import { describe, it, expect } from 'vitest';
import { COMMERCIAL_RULES, calculateShippingCost } from './commercialRules';

describe('COMMERCIAL_RULES Single Source of Truth', () => {
  it('should have consistent free shipping threshold at 49 euros', () => {
    expect(COMMERCIAL_RULES.FREE_SHIPPING_THRESHOLD).toBe(49.00);
    expect(COMMERCIAL_RULES.STANDARD_SHIPPING_PRICE).toBe(4.90);
    expect(COMMERCIAL_RULES.CLICK_COLLECT_PRICE).toBe(0.00);
  });

  it('should give free shipping for click_and_collect regardless of amount', () => {
    const resultLow = calculateShippingCost(10, 'click_and_collect');
    expect(resultLow.shippingCost).toBe(0);
    expect(resultLow.isFree).toBe(true);
    expect(resultLow.remainingForFree).toBe(0);

    const resultZero = calculateShippingCost(0, 'click_and_collect');
    expect(resultZero.shippingCost).toBe(0);
  });

  it('should charge shipping when subtotal is below 49 euros for home delivery', () => {
    const result = calculateShippingCost(30.00, 'domicilio', '47001');
    expect(result.shippingCost).toBe(4.90);
    expect(result.isFree).toBe(false);
    expect(result.remainingForFree).toBe(19.00);
  });

  it('should grant free shipping when subtotal reaches or exceeds 49 euros', () => {
    const resultExact = calculateShippingCost(49.00, 'domicilio', '28001');
    expect(resultExact.shippingCost).toBe(0);
    expect(resultExact.isFree).toBe(true);
    expect(resultExact.remainingForFree).toBe(0);

    const resultAbove = calculateShippingCost(55.20, 'domicilio', '28001');
    expect(resultAbove.shippingCost).toBe(0);
    expect(resultAbove.isFree).toBe(true);
  });

  it('should apply special threshold for Balearic Islands (07xxx)', () => {
    const resultUnder = calculateShippingCost(50.00, 'domicilio', '07001');
    expect(resultUnder.zone.id).toBe('baleares');
    expect(resultUnder.shippingCost).toBe(8.90);
    expect(resultUnder.isFree).toBe(false);
    expect(resultUnder.remainingForFree).toBe(35.00);

    const resultOver = calculateShippingCost(90.00, 'domicilio', '07001');
    expect(resultOver.shippingCost).toBe(0);
    expect(resultOver.isFree).toBe(true);
  });
});
