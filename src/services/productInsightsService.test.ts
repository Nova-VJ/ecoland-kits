import { describe, it, expect, beforeEach } from 'vitest';
import { productInsightsService } from './productInsightsService';
import { dailyNutritionStore } from './dailyNutritionStore';

describe('Product Insights & Retention Validation Lab (P2.5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Registra useful_day únicamente con acciones significativas y calcula useful_days_per_week', () => {
    // Al inicio con base limpia, se registra una acción significativa
    productInsightsService.recordMeaningfulAction('food_logged', { meal: 'comida' });
    
    const usefulDays = productInsightsService.getUsefulDaysPerWeek();
    expect(usefulDays).toBeGreaterThanOrEqual(1);

    const history = productInsightsService.getUsefulDaysHistory();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = history.find(h => h.date === todayStr);

    expect(todayEntry).toBeDefined();
    expect(todayEntry?.actions).toContain('food_logged');
    expect(todayEntry?.actionCount).toBeGreaterThanOrEqual(1);
  });

  it('2. Calcula Non-Commerce Retention sin depender de compras en tienda', () => {
    // Añadimos días útiles sin compras
    productInsightsService.recordMeaningfulAction('coach_action_executed');
    const retention = productInsightsService.getNonCommerceRetention();

    expect(retention.d1).toBeGreaterThanOrEqual(40);
    expect(retention.d7).toBeGreaterThanOrEqual(30);
    expect(retention.d14).toBeGreaterThanOrEqual(25);
    expect(retention.d30).toBeGreaterThanOrEqual(20);
  });

  it('3. Mide funnel de registro con duración y distribución por método', () => {
    const session = productInsightsService.startLoggingSession('voice');
    expect(session.step).toBe('log_started');
    expect(session.method).toBe('voice');

    productInsightsService.updateLoggingSessionStep('food_detected');
    productInsightsService.updateLoggingSessionStep('food_review_started');
    productInsightsService.updateLoggingSessionStep('food_corrected', { wasCorrected: true });
    productInsightsService.updateLoggingSessionStep('log_completed');

    const summary = productInsightsService.getAggregatedInsights();
    expect(summary.loggingFunnel.totalCompleted).toBeGreaterThan(0);
    expect(summary.loggingFunnel.completionRate).toBeGreaterThan(50);
    expect(summary.loggingFunnel.medianDurationSeconds).toBeGreaterThan(0);
  });

  it('4. Calcula Coach Action Rate y almacena feedback cualitativo con motivos', () => {
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
    expect(summary.coachMetrics.responsesShown).toBeGreaterThan(0);
    expect(summary.coachMetrics.actionRate).toBeGreaterThan(0);
    expect(summary.coachMetrics.negativeReasonsBreakdown['too_much_time']).toBeGreaterThanOrEqual(1);
  });

  it('5. Sugiere exclusión explícita si se rechaza un ingrediente repetidamente', () => {
    // Primer rechazo
    const res1 = productInsightsService.trackFoodRejection('tofu_ahumado');
    expect(res1.shouldPromptExclusion).toBe(false);

    // Segundo rechazo repetido
    const res2 = productInsightsService.trackFoodRejection('tofu_ahumado');
    expect(res2.shouldPromptExclusion).toBe(true);
    expect(res2.foodName).toBe('tofu_ahumado');

    // Confirmar exclusión formal
    productInsightsService.confirmExcludeFood('tofu_ahumado');
    const prefs = productInsightsService.getRecommendationPreferences();
    expect(prefs.dislikedFoods).toContain('tofu_ahumado');
  });

  it('6. Garantiza aislamiento estricto de privacidad entre miembros del hogar', () => {
    const isolation = dailyNutritionStore.verifyHouseholdMemberPrivacyIsolation('user_laura', 'user_carlos');
    
    // Lo compartido es accesible
    expect(isolation.canAccessSharedPantry).toBe(true);
    expect(isolation.canAccessSharedList).toBe(true);

    // Los datos individuales y biométricos son estrictamente privados
    expect(isolation.canAccessOtherMemberDiary).toBe(false);
    expect(isolation.canAccessOtherMemberWeight).toBe(false);
    expect(isolation.canAccessOtherMemberBiometrics).toBe(false);
  });

  it('7. Gestiona variantes de experimentos controlados con guardrail metrics', () => {
    const exps = productInsightsService.getExperiments();
    expect(exps.length).toBeGreaterThanOrEqual(2);

    const firstExp = exps[0];
    expect(firstExp.activeVariant).toBe('A');

    // Cambiar a variante B
    productInsightsService.setExperimentVariant(firstExp.id, 'B');
    const updatedExps = productInsightsService.getExperiments();
    expect(updatedExps[0].activeVariant).toBe('B');
  });

  it('8. Evalúa Product-Market Fit mediante el Sean Ellis Test', () => {
    productInsightsService.recordPMFSurveyResponse('very_disappointed');
    const summary = productInsightsService.getAggregatedInsights();

    expect(summary.pmfSurveyScore.totalResponses).toBeGreaterThanOrEqual(1);
    expect(summary.pmfSurveyScore.veryDisappointedPercent).toBeGreaterThanOrEqual(40);
  });
});
