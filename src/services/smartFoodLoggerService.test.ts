import { describe, it, expect, beforeEach } from 'vitest';
import { smartFoodLoggerService } from './smartFoodLoggerService';

describe('Smart Food Logger 3.0 Service (P3-A)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Orden adaptativo según la hora del día', () => {
    const morningOrder = smartFoodLoggerService.getContextualMethodOrder(8);
    expect(morningOrder[0]).toBe('HABITUAL');
    expect(morningOrder).toContain('REPEAT');

    const lunchOrder = smartFoodLoggerService.getContextualMethodOrder(14);
    expect(lunchOrder[0]).toBe('EATING_OUT');

    const dinnerOrder = smartFoodLoggerService.getContextualMethodOrder(21);
    expect(dinnerOrder[0]).toBe('RECIPE');
  });

  it('2. Food Fingerprint detecta alérgenos declarados y evalúa compatibilidad', () => {
    smartFoodLoggerService.saveFoodFingerprint({
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isLactoseFree: false,
      declaredAllergies: ['cacahuetes'],
      declaredIntolerances: [],
      dislikedFoods: ['tofu'],
      dietaryPreferences: ['mediterranea']
    });

    // Producto con gluten
    const resGluten = smartFoodLoggerService.evaluateCompatibility('Harina de trigo, sal, levadura.');
    expect(resGluten.status).toBe('NO_COMPATIBLE');
    expect(resGluten.reason).toContain('gluten');

    // Producto con cacahuetes (alergia crítica)
    const resAllergy = smartFoodLoggerService.evaluateCompatibility('Aceite vegetal, cacahuetes tostados.');
    expect(resAllergy.status).toBe('NO_COMPATIBLE');
    expect(resAllergy.reason).toContain('alergia declarada');

    // Producto compatible
    const resOk = smartFoodLoggerService.evaluateCompatibility('Arroz integral, lentejas, zanahoria.');
    expect(resOk.status).toBe('COMPATIBLE');
    expect(resOk.matchedWarnings.length).toBe(0);
  });

  it('3. Análisis de Foto con Motor de Confianza y modificador de porción', () => {
    const initial = smartFoodLoggerService.analyzePhotoMeal('dummy_photo_base64', 'sin aceite');
    expect(initial.confidenceLevel).toBe('ALTA');
    expect(initial.ingredients.length).toBeGreaterThan(2);

    // Como se indicó 'sin aceite', el aceite debe ser 0 cals
    const oilItem = initial.ingredients.find(i => i.name.includes('Aceite'));
    expect(oilItem?.calories).toBe(0);

    // Escalar porción al 150% (1.5x)
    const scaled = smartFoodLoggerService.scalePhotoPortion(initial, 1.5);
    expect(scaled.totalCalories).toBe(Math.round(initial.totalCalories * 1.5));
    expect(scaled.portionMultiplier).toBe(1.5);
  });

  it('4. Resolución Universal EAN con jerarquía de fuentes', () => {
    // Código Ecoland Verificado
    const ecolandProd = smartFoodLoggerService.resolveBarcodeUniversal('843700000001');
    expect(ecolandProd.provenance.source).toBe('ECOLAND_VERIFIED');
    expect(ecolandProd.provenance.confidencePercent).toBe(100);

    // Código Externo OpenFoodFacts
    const externalProd = smartFoodLoggerService.resolveBarcodeUniversal('761234567890');
    expect(externalProd.provenance.source).toBe('OPEN_FOOD_FACTS');
    expect(externalProd.provenance.confidencePercent).toBeLessThan(100);
  });

  it('5. Escáner de Carta (MenuScan) experimental extrae platos y añade advertencia médica', () => {
    const menuResult = smartFoodLoggerService.parseRestaurantMenu('Carta del día restaurante');
    expect(menuResult.dishes.length).toBeGreaterThanOrEqual(3);
    expect(menuResult.disclaimer).toContain('Consulta siempre al personal del restaurante');

    const fishDish = menuResult.dishes.find(d => d.name.includes('Lubina'));
    expect(fishDish?.isLightOption).toBe(true);
    expect(fishDish?.estimatedProtein).toBeGreaterThan(30);
  });

  it('6. Comí Fuera 2.0 guarda restaurantes y platos habituales', () => {
    smartFoodLoggerService.saveRestaurantMeal('Restaurante El Rincón', 'Salmón con verduras', 450, 38, 5);
    const saved = smartFoodLoggerService.getSavedRestaurants();
    const found = saved.find(s => s.restaurantName === 'Restaurante El Rincón');

    expect(found).toBeDefined();
    expect(found?.dishName).toBe('Salmón con verduras');
    expect(found?.timesLogged).toBe(1);
  });
});
