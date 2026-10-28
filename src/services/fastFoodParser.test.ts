import { describe, it, expect } from 'vitest';
import { fastFoodParser } from './fastFoodParser';

describe('FastFoodParser - Multi-modal 5-in-1 logging engine', () => {
  describe('parseNaturalText (Text and Voice)', () => {
    it('detects single food and quantity (e.g., 200g lentejas)', () => {
      const result = fastFoodParser.parseNaturalText('200g de lentejas');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].name.toLowerCase()).toContain('lenteja');
      expect(result.items[0].weightGrams).toBe(200);
      expect(result.totalEstimatedCalories).toBeGreaterThan(0);
      expect(result.totalProtein).toBeGreaterThan(0);
    });

    it('parses composite meal text with multiple ingredients and portions', () => {
      const result = fastFoodParser.parseNaturalText('2 tostadas con aguacate y cafe con leche');
      expect(result.items.length).toBeGreaterThanOrEqual(2);
      expect(result.totalEstimatedCalories).toBeGreaterThan(200);
      expect(result.confidenceNotice).toBeDefined();
    });

    it('cleans speech filler words from voice input', () => {
      const result = fastFoodParser.parseNaturalText('eh pues me comí dos plátanos y un yogur', 'voice');
      expect(result.source).toBe('voice');
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      const names = result.items.map(i => i.name.toLowerCase()).join(' ');
      expect(names).toContain('platano');
    });

    it('handles fallback gracefully when food is unfamiliar', () => {
      const result = fastFoodParser.parseNaturalText('plato misterioso no registrado');
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe('plato misterioso no registrado');
      expect(result.items[0].calories).toBe(320);
    });
  });

  describe('parsePhotoMeal (Vision AI presets)', () => {
    it('returns calibrated nutrients for known visual presets', () => {
      const bowl = fastFoodParser.parsePhotoMeal('bowl_avena');
      expect(bowl.source).toBe('photo');
      expect(bowl.totalEstimatedCalories).toBe(385);
      expect(bowl.totalFiber).toBeGreaterThan(5);

      const salad = fastFoodParser.parsePhotoMeal('ensalada_quinoa');
      expect(salad.totalProtein).toBeGreaterThan(15);
      expect(salad.items.length).toBe(4);

      const toast = fastFoodParser.parsePhotoMeal('tostadas_aguacate');
      expect(toast.totalEstimatedCalories).toBe(395);
      expect(toast.items.some(i => i.name.includes('Aguacate'))).toBe(true);
    });
  });
});
