import { describe, it, expect, beforeEach } from 'vitest';
import { ecoCoachService } from './ecoCoachService';
import { dailyNutritionStore } from './dailyNutritionStore';

describe('EcoCoach Contextual Service (P2-A)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Responde a "¿Qué debería consumir antes de que se estropee?" priorizando alimentos que vencen pronto', () => {
    const res = ecoCoachService.queryCoach({ text: '¿Qué debería consumir antes de que se estropee?' });
    expect(res).toBeDefined();
    expect(res.infoType).toBe('SUGERENCIA');
    expect(res.dataGrounding).toContain('despensa');
    expect(res.recipeCard).toBeDefined();
    expect(res.actions.some(a => a.type === 'use_pantry' || a.type === 'cook')).toBe(true);
  });

  it('2. Evalúa balance proteico cuando se pregunta "¿Tengo suficiente proteína hoy?" sin inventar datos', () => {
    const res = ecoCoachService.queryCoach({ text: '¿Tengo suficiente proteína hoy?' });
    expect(res).toBeDefined();
    expect(['DATO', 'SUGERENCIA']).toContain(res.infoType);
    expect(res.dataGrounding).toContain('diario');
  });

  it('3. Resuelve consultas de tiempo limitado: "Me quedan 15 minutos, ¿qué hago?"', () => {
    const res = ecoCoachService.queryCoach({ text: 'Me quedan 15 minutos, ¿qué hago?' });
    expect(res.recipeCard).toBeDefined();
    expect(res.recipeCard?.prepTimeMinutes).toBeLessThanOrEqual(15);
    expect(res.recipeCard?.allPantryAvailable).toBe(true);
  });

  it('4. Ejecuta acción [REGISTRAR EN MI DÍA] cerrando el bucle en el diario', () => {
    const initialLogsCount = dailyNutritionStore.getTodayLogs().length;
    const actionResult = ecoCoachService.executeAction({
      id: 'test_act',
      label: 'Registrar en mi día',
      type: 'log_diary',
      payload: { title: 'Plato Test EcoCoach', cals: 350, prot: 15, fiber: 8, meal: 'cena' }
    });

    expect(actionResult.success).toBe(true);
    const newLogs = dailyNutritionStore.getTodayLogs();
    expect(newLogs.length).toBe(initialLogsCount + 1);
    expect(newLogs.some(log => log.name.includes('Plato Test EcoCoach'))).toBe(true);
  });

  it('5. Sugiere tres cenas baratas calculando ingredientes de despensa para coste extra 0€', () => {
    const res = ecoCoachService.queryCoach({ text: 'Ayúdame a planificar tres cenas baratas' });
    expect(res.message).toContain('0,00 €');
    expect(res.actions.some(a => a.type === 'add_to_plan')).toBe(true);
  });

  it('6. Food Vision: reconoce comida por foto y calcula calorías con confirmación previa y alternativas', () => {
    const res = ecoCoachService.queryCoach({ text: 'Analizar foto de mi plato de lentejas' });
    expect(res.infoType).toBe('ESTIMACIÓN');
    expect(res.visionCard).toBeDefined();
    expect(res.visionCard?.calories).toBeGreaterThan(0);
    expect(res.visionCard?.confidencePercent).toBeGreaterThanOrEqual(80);
    expect(res.visionCard?.alternativeOptions.length).toBeGreaterThan(0);
    expect(res.actions.some(a => a.type === 'log_diary')).toBe(true);
  });

  it('7. Adapta dinámicamente el plato según tiempo disponible (10 min vs 5 min)', () => {
    const res10 = ecoCoachService.queryCoach({ text: '¿Qué puedo cenar en 10 minutos?' });
    expect(res10.recipeCard).toBeDefined();
    expect(res10.recipeCard?.prepTimeMinutes).toBeLessThanOrEqual(10);

    const res5 = ecoCoachService.queryCoach({ text: 'Solo tengo 5 minutos para comer' });
    expect(res5.recipeCard).toBeDefined();
    expect(res5.recipeCard?.prepTimeMinutes).toBeLessThanOrEqual(5);
  });

  it('8. Filtra y respeta alérgenos declarados (ej: gluten)', () => {
    const resGlutenFree = ecoCoachService.queryCoach({ 
      text: '¿Qué puedo cenar rápido?',
      avoidAllergens: ['gluten']
    });
    expect(resGlutenFree.recipeCard).toBeDefined();
    expect(resGlutenFree.recipeCard?.title.toLowerCase()).not.toContain('tostada');
    expect(resGlutenFree.recipeCard?.title.toLowerCase()).not.toContain('pan');
  });

  it('9. Asocia producto bio del catálogo de Ecoland para compra en 1 clic', () => {
    const res = ecoCoachService.queryCoach({ text: '¿Qué puedo cenar en 10 minutos?' });
    expect(res.recommendedProduct).toBeDefined();
    expect(res.recommendedProduct?.name).toBeDefined();
    expect(res.recommendedProduct?.price).toBeGreaterThan(0);
  });
});
