import { describe, it, expect, beforeEach } from 'vitest';
import { productInsightsService } from './productInsightsService';
import { dailyNutritionStore } from './dailyNutritionStore';

describe('Product Insights & Real User Pilot Lab (P2.5B)', () => {
  beforeEach(() => {
    localStorage.clear();
    productInsightsService.resetSessionState();
    productInsightsService.setDataSource('REAL');
  });

  it('1. Separa estrictamente REAL DATA de SIMULATED DATA', () => {
    expect(productInsightsService.getDataSource()).toBe('REAL');

    // Cambiar a SIMULATED
    productInsightsService.setDataSource('SIMULATED');
    expect(productInsightsService.getDataSource()).toBe('SIMULATED');

    const simSummary = productInsightsService.getAggregatedInsights();
    expect(simSummary.dataSource).toBe('SIMULATED');
    expect(simSummary.pilotStatus).toBe('SIMULATED_BENCHMARK');
    expect(simSummary.usefulDaysPerWeek.average).toBe(3.8);

    // Cambiar a REAL
    productInsightsService.setDataSource('REAL');
    const realSummary = productInsightsService.getAggregatedInsights();
    expect(realSummary.dataSource).toBe('REAL');
    expect(realSummary.pilotStatus).toBe('PILOT_IN_PROGRESS');
    expect(realSummary.sampleSize.totalTargetUsers).toBe(20);
  });

  it('2. Registra Useful Day con cohortes de usuario (N=20)', () => {
    productInsightsService.recordMeaningfulAction('food_logged', {
      userId: 'pilot_user_1',
      cohort: 'BIO_CUSTOMER'
    });

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.sampleSize.activeUsers).toBe(1);
    expect(summary.nonCommerceRetention.d1.denominator).toBeGreaterThanOrEqual(1);
  });

  it('3. Mide Time to First Value (TTFV) y First Value Type', () => {
    productInsightsService.recordFirstSessionStarted();
    productInsightsService.recordMeaningfulAction('coach_action_executed');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.timeToFirstValue.firstValueDistribution.COACH).toBe(1);
    expect(summary.timeToFirstValue.medianSeconds).toBeGreaterThanOrEqual(0);
  });

  it('4. Controla frecuencia de Decision Saved Feedback (throttling ético)', () => {
    // 3 acciones no deben disparar el prompt
    productInsightsService.recordMeaningfulAction('food_logged');
    productInsightsService.recordMeaningfulAction('pantry_item_used');
    productInsightsService.recordMeaningfulAction('weekly_plan_updated');
    expect(productInsightsService.shouldPromptDecisionSaved()).toBe(false);

    // La 4ª acción habilita el prompt
    productInsightsService.recordMeaningfulAction('recipe_cooked');
    expect(productInsightsService.shouldPromptDecisionSaved()).toBe(true);

    // Registrar respuesta
    productInsightsService.recordDecisionSavedFeedback('coach', 'yes');
    const records = productInsightsService.getDecisionSavedRecords();
    expect(records.length).toBe(1);
    expect(records[0].answer).toBe('yes');
  });

  it('5. Registra EcoCoach Action Rate y Reuse Rate a 7 días', () => {
    productInsightsService.recordCoachResponseShown('¿Qué ceno?', 'Guiso suave de lentejas');
    productInsightsService.recordCoachActionClicked('coach_cook_clicked');

    const feedback = productInsightsService.recordCoachFeedback({
      query: '¿Qué ceno?',
      responseTitle: 'Guiso suave de lentejas',
      isHelpful: false,
      negativeReason: 'too_much_time'
    });

    expect(feedback.isHelpful).toBe(false);
    expect(feedback.negativeReason).toBe('too_much_time');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.coachMetrics.responsesShown).toBe(1);
    expect(summary.coachMetrics.actionRate.percentage).toBe(100);
    expect(summary.coachMetrics.negativeReasonsBreakdown['too_much_time']).toBe(1);
  });

  it('6. Mide seguimiento de Plan Semanal (Created vs Used)', () => {
    productInsightsService.recordWeeklyPlanEvent('PLAN_CREATED', 'Menú mediterráneo');
    productInsightsService.recordWeeklyPlanEvent('PLAN_USED', 'Consulta de cena');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.usefulDaysPerWeek.average).toBeGreaterThanOrEqual(1);
  });

  it('7. Mide seguimiento de alimentos «Úsalo pronto» en despensa', () => {
    productInsightsService.recordUseSoonItemShown('pantry_item_espinacas');
    productInsightsService.recordUseSoonItemConsumed('pantry_item_espinacas');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.usefulDaysPerWeek.average).toBeGreaterThanOrEqual(1);
  });

  it('8. Mide embudo de importación de recetas externas', () => {
    const importId = productInsightsService.startRecipeImport();
    productInsightsService.updateRecipeImportStatus(importId, 'saved');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.recipeImportMetrics.totalStarted).toBe(1);
    expect(summary.recipeImportMetrics.totalCompleted).toBe(1);
    expect(summary.recipeImportMetrics.completionRate.percentage).toBe(100);
  });

  it('9. Garantiza aislamiento de privacidad en Hogar Ecoland', () => {
    const isolation = dailyNutritionStore.verifyHouseholdMemberPrivacyIsolation('user_laura', 'user_carlos');
    expect(isolation.canAccessSharedPantry).toBe(true);
    expect(isolation.canAccessSharedList).toBe(true);
    expect(isolation.canAccessOtherMemberDiary).toBe(false);
    expect(isolation.canAccessOtherMemberWeight).toBe(false);
  });

  it('10. Reporta Sean Ellis PMF Test con notación n/N', () => {
    productInsightsService.recordPMFSurveyResponse('very_disappointed');
    const summary = productInsightsService.getAggregatedInsights();

    expect(summary.pmfSurveyScore.totalResponses).toBe(1);
    expect(summary.pmfSurveyScore.veryDisappointed.formatted).toContain('1/1');
    expect(summary.pmfSurveyScore.pmfSignalAchieved).toBe(false); // Requiere N>=20
  });
});
