/**
 * PRODUCT INSIGHTS & REAL USER PILOT SERVICE (P2.5B)
 * 
 * Filosofía:
 * - Descubrir QUÉ HACE QUE EL USUARIO QUIERA VOLVER VOLUNTARIAMENTE.
 * - Cero Dark Patterns: sin rachas punitivas, sin culpa, sin falsa urgencia, sin spam.
 * - Estricta separación: REAL USER DATA vs. SIMULATED DATA vs. TEST.
 * - Presentación transparente: siempre reportar n/N absoluto + porcentaje para evitar falsa precisión.
 * - Métrica Norte: Useful Days por semana (≥1 acción significativa real).
 * - Retención no comercial: Medir el valor diario con independencia del ecommerce.
 * - Privacidad por diseño: Métricas agregadas anónimas; aislamiento estricto de biometría/diarios.
 */

export type DataSourceMode = 'REAL' | 'SIMULATED' | 'TEST';

export type PilotCohort = 'BIO_CUSTOMER' | 'NUTRITION' | 'HOUSEHOLD' | 'ORGANIZATION';

export type MeaningfulActionType =
  | 'food_logged'
  | 'habitual_meal_logged'
  | 'recipe_cooked'
  | 'coach_action_executed'
  | 'pantry_item_used'
  | 'weekly_plan_updated'
  | 'weekly_plan_completed'
  | 'shopping_list_updated'
  | 'shopping_list_created'
  | 'recipe_imported'
  | 'household_interaction'
  | 'use_soon_item_consumed';

export type FirstValueType =
  | 'FOOD_LOGGING'
  | 'COACH'
  | 'PANTRY'
  | 'WEEK_PLAN'
  | 'SHOPPING_LIST'
  | 'RECIPE'
  | 'HOUSEHOLD';

export interface UsefulDayEntry {
  date: string; // YYYY-MM-DD
  userId?: string;
  cohort?: PilotCohort;
  actionCount: number;
  actions: MeaningfulActionType[];
  hadEcommercePurchase: boolean;
}

export type LogMethod = 'habitual' | 'repeat' | 'search' | 'EAN' | 'text' | 'voice' | 'photo' | 'eating_out';

export interface LogFunnelRecord {
  id: string;
  userId?: string;
  method: LogMethod;
  startTime: number;
  endTime?: number;
  durationSeconds?: number;
  step: 'log_started' | 'log_method_selected' | 'food_detected' | 'food_review_started' | 'food_corrected' | 'log_completed' | 'log_abandoned';
  wasCorrected?: boolean;
}

export type CoachActionType =
  | 'coach_cook_clicked'
  | 'coach_log_clicked'
  | 'coach_save_clicked'
  | 'coach_plan_clicked'
  | 'coach_pantry_clicked'
  | 'coach_missing_items_clicked'
  | 'coach_no_action';

export interface CoachFeedbackEntry {
  id: string;
  userId?: string;
  timestamp: string;
  query: string;
  responseTitle: string;
  isHelpful: boolean;
  negativeReason?: 'no_ingredients' | 'too_much_time' | 'too_expensive' | 'did_not_feel_like_it' | 'not_what_i_wanted' | 'other';
  otherReasonText?: string;
}

export interface DecisionSavedEntry {
  id: string;
  timestamp: string;
  context: 'coach' | 'what_to_do_now' | 'dinner_help' | 'pantry_rescue';
  answer: 'yes' | 'somewhat' | 'no';
}

export interface RecipeImportMetricRecord {
  id: string;
  startTime: number;
  endTime?: number;
  durationSeconds?: number;
  status: 'started' | 'completed' | 'failed' | 'edited' | 'saved' | 'added_to_week';
}

export interface SampleMetric {
  numerator: number;
  denominator: number;
  percentage: number;
  formatted: string;
}

export interface ProductInsightsSummary {
  dataSource: DataSourceMode;
  pilotStatus: 'PILOT_IN_PROGRESS' | 'SIMULATED_BENCHMARK' | 'TEST_MODE';
  pilotDay: number; // 0 to 30
  cohorts: Record<PilotCohort, { targetUsers: number; activeUsers: number }>;
  sampleSize: {
    totalTargetUsers: number;
    enrolledUsers: number;
    activeUsers: number;
    dropoutUsers: number;
  };
  usefulDaysPerWeek: {
    average: number;
    formatted: string;
  };
  timeToFirstValue: {
    medianSeconds: number;
    buckets: {
      under30s: number;
      from30to60s: number;
      from1to2m: number;
      from2to5m: number;
      over5m: number;
    };
    firstValueDistribution: Record<FirstValueType, number>;
  };
  nonCommerceRetention: {
    d1: SampleMetric;
    d7: SampleMetric;
    d14: SampleMetric;
    d30: SampleMetric;
  };
  loggingFunnel: {
    totalStarted: number;
    totalCompleted: number;
    completionRate: SampleMetric;
    medianDurationSeconds: number;
    durationDistribution: {
      under5s: number;
      from5to10s: number;
      from10to20s: number;
      from20to40s: number;
      over40s: number;
    };
    byMethod: Record<LogMethod, { count: number; medianSeconds: number; correctionRate: number; abandonmentRate: number }>;
  };
  coachMetrics: {
    responsesShown: number;
    actionsExecuted: number;
    actionRate: SampleMetric;
    reuseRate7Days: SampleMetric;
    helpfulRatio: SampleMetric;
    negativeReasonsBreakdown: Record<string, number>;
  };
  decisionSaved: {
    totalPrompted: number;
    answers: {
      yes: number;
      somewhat: number;
      no: number;
    };
    savedRatio: SampleMetric;
  };
  weeklyPlanMetrics: {
    plansCreated: number;
    plansUsed: number;
    followthroughRate: SampleMetric;
  };
  pantryMetrics: {
    useSoonItemsShown: number;
    useSoonItemsConsumed: number;
    useSoonFollowthroughRate: SampleMetric;
  };
  recipeImportMetrics: {
    totalStarted: number;
    totalCompleted: number;
    completionRate: SampleMetric;
    medianSeconds: number;
  };
  discoveredFeatures: Record<string, number>;
  simpleModeVsNutrition: {
    simpleModeCount: number;
    nutritionModeCount: number;
    switchesToSimple: number;
    switchesToNutrition: number;
    simpleRetentionDays: number;
    nutritionRetentionDays: number;
  };
  pmfSurveyScore: {
    veryDisappointed: SampleMetric;
    somewhatDisappointed: SampleMetric;
    notDisappointed: SampleMetric;
    totalResponses: number;
    pmfSignalAchieved: boolean; // true if veryDisappointed >= 40% AND N >= 20
  };
}

export interface RecommendationPreferences {
  maxWeekdayCookingTimeMinutes: number;
  dislikedFoods: string[];
  preferredRecipeTypes: string[];
  preferredBudgetLevel: 'economico' | 'medio' | 'flexible';
  rejectedFoodCounts: Record<string, number>;
}

export interface ControlledExperiment {
  id: string;
  name: string;
  hypothesis: string;
  activeVariant: 'A' | 'B';
  primaryMetric: string;
  guardrailMetric: string;
  startedAt: string;
  variantMetrics: {
    A: { sampleCount: number; primaryValue: number; guardrailAlerts: number };
    B: { sampleCount: number; primaryValue: number; guardrailAlerts: number };
  };
}

class ProductInsightsService {
  private activeDataSource: DataSourceMode = 'REAL';

  // Real dataset keys
  private readonly REAL_USEFUL_DAYS_KEY = 'ecoland_real_useful_days_v1';
  private readonly REAL_LOG_FUNNELS_KEY = 'ecoland_real_log_funnels_v1';
  private readonly REAL_COACH_KEY = 'ecoland_real_coach_feedback_v1';
  private readonly REAL_COACH_INTERACTIONS_KEY = 'ecoland_real_coach_interactions_v1';
  private readonly REAL_DECISIONS_KEY = 'ecoland_real_decisions_v1';
  private readonly REAL_IMPORTS_KEY = 'ecoland_real_imports_v1';
  private readonly REAL_PMF_KEY = 'ecoland_real_pmf_v1';
  private readonly REAL_FIRST_VALUE_KEY = 'ecoland_real_first_value_v1';
  private readonly REAL_SESSION_START_KEY = 'ecoland_real_session_start_v1';

  // Simulated dataset keys (explicit benchmark)
  private readonly SIM_USEFUL_DAYS_KEY = 'ecoland_sim_useful_days_v1';
  private readonly SIM_LOG_FUNNELS_KEY = 'ecoland_sim_log_funnels_v1';
  private readonly SIM_COACH_KEY = 'ecoland_sim_coach_feedback_v1';
  private readonly SIM_PMF_KEY = 'ecoland_sim_pmf_v1';

  // Common preferences & experiments
  private readonly PREFERENCES_KEY = 'ecoland_recommendation_preferences_v1';
  private readonly EXPERIMENTS_KEY = 'ecoland_controlled_experiments_v1';
  private readonly DATA_SOURCE_KEY = 'ecoland_insights_datasource_mode_v1';

  private currentActiveLogSession: LogFunnelRecord | null = null;
  private actionsSinceLastDecisionPrompt = 0;

  public resetSessionState(): void {
    this.actionsSinceLastDecisionPrompt = 0;
    this.currentActiveLogSession = null;
  }

  constructor() {
    try {
      const savedMode = localStorage.getItem(this.DATA_SOURCE_KEY);
      if (savedMode === 'REAL' || savedMode === 'SIMULATED' || savedMode === 'TEST') {
        this.activeDataSource = savedMode;
      }
    } catch {}
  }

  // ==========================================
  // DATA SOURCE SWITCHER (STRICT SEPARATION)
  // ==========================================

  public getDataSource(): DataSourceMode {
    return this.activeDataSource;
  }

  public setDataSource(mode: DataSourceMode): void {
    this.activeDataSource = mode;
    try {
      localStorage.setItem(this.DATA_SOURCE_KEY, mode);
    } catch {}
  }

  // ==========================================
  // 1 & 2. USEFUL DAYS & PILOT COHORTS
  // ==========================================

  public recordMeaningfulAction(actionType: MeaningfulActionType, metadata?: { userId?: string; cohort?: PilotCohort; [key: string]: unknown }): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const days = this.getRawUsefulDays(this.activeDataSource);

    let dayEntry = days.find(d => d.date === todayStr);
    if (!dayEntry) {
      dayEntry = {
        date: todayStr,
        userId: metadata?.userId || 'pilot_user_local',
        cohort: metadata?.cohort || 'BIO_CUSTOMER',
        actionCount: 0,
        actions: [],
        hadEcommercePurchase: false
      };
      days.push(dayEntry);
    }

    dayEntry.actionCount += 1;
    if (!dayEntry.actions.includes(actionType)) {
      dayEntry.actions.push(actionType);
    }

    this.saveRawUsefulDays(days, this.activeDataSource);

    // Track First Value if not already marked
    this.checkAndRecordFirstValue(actionType);

    // Track decision throttle count
    this.actionsSinceLastDecisionPrompt++;
  }

  public recordEcommercePurchase(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const days = this.getRawUsefulDays(this.activeDataSource);
    const dayEntry = days.find(d => d.date === todayStr);
    if (dayEntry) {
      dayEntry.hadEcommercePurchase = true;
      this.saveRawUsefulDays(days, this.activeDataSource);
    }
  }

  // ==========================================
  // 3 & 4. TIME TO FIRST VALUE & FIRST VALUE TYPE
  // ==========================================

  public recordFirstSessionStarted(): void {
    const existing = localStorage.getItem(this.REAL_SESSION_START_KEY);
    if (!existing) {
      localStorage.setItem(this.REAL_SESSION_START_KEY, Date.now().toString());
    }
  }

  private checkAndRecordFirstValue(action: MeaningfulActionType): void {
    const firstValueDone = localStorage.getItem(this.REAL_FIRST_VALUE_KEY);
    if (firstValueDone) return; // already recorded

    const startRaw = localStorage.getItem(this.REAL_SESSION_START_KEY);
    const startTime = startRaw ? parseInt(startRaw, 10) : Date.now();
    const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    let fType: FirstValueType = 'FOOD_LOGGING';
    if (action === 'food_logged' || action === 'habitual_meal_logged') fType = 'FOOD_LOGGING';
    else if (action === 'coach_action_executed') fType = 'COACH';
    else if (action === 'pantry_item_used' || action === 'use_soon_item_consumed') fType = 'PANTRY';
    else if (action === 'weekly_plan_updated' || action === 'weekly_plan_completed') fType = 'WEEK_PLAN';
    else if (action === 'shopping_list_updated' || action === 'shopping_list_created') fType = 'SHOPPING_LIST';
    else if (action === 'recipe_cooked' || action === 'recipe_imported') fType = 'RECIPE';
    else if (action === 'household_interaction') fType = 'HOUSEHOLD';

    const record = {
      timestamp: new Date().toISOString(),
      durationSeconds: durationSec,
      firstValueType: fType
    };

    localStorage.setItem(this.REAL_FIRST_VALUE_KEY, JSON.stringify(record));
  }

  // ==========================================
  // 7. DECISION SAVED FEEDBACK
  // ==========================================

  public shouldPromptDecisionSaved(): boolean {
    // Máximo 1 solicitud ocasional por cada 4 acciones para no interrumpir
    if (this.actionsSinceLastDecisionPrompt >= 4) {
      this.actionsSinceLastDecisionPrompt = 0;
      return true;
    }
    return false;
  }

  public recordDecisionSavedFeedback(context: DecisionSavedEntry['context'], answer: 'yes' | 'somewhat' | 'no'): void {
    const list = this.getDecisionSavedRecords();
    list.push({
      id: `dec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context,
      answer
    });
    try {
      localStorage.setItem(this.REAL_DECISIONS_KEY, JSON.stringify(list.slice(-100)));
    } catch {}
  }

  public getDecisionSavedRecords(): DecisionSavedEntry[] {
    try {
      const raw = localStorage.getItem(this.REAL_DECISIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  // ==========================================
  // 8. ECOCOACH ACTION RATE & REUSE RATE (7 DÍAS)
  // ==========================================

  public recordCoachResponseShown(query: string, responseTitle: string): void {
    const key = this.activeDataSource === 'REAL' ? this.REAL_COACH_INTERACTIONS_KEY : 'ecoland_sim_coach_interactions_v1';
    const list = this.getRawCoachInteractions(key);
    list.push({
      id: `resp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      query,
      responseTitle,
      actionClicked: false
    });
    try {
      localStorage.setItem(key, JSON.stringify(list.slice(-100)));
    } catch {}
  }

  public recordCoachActionClicked(actionType: CoachActionType): void {
    const key = this.activeDataSource === 'REAL' ? this.REAL_COACH_INTERACTIONS_KEY : 'ecoland_sim_coach_interactions_v1';
    const list = this.getRawCoachInteractions(key);
    if (list.length > 0) {
      list[list.length - 1].actionClicked = true;
      list[list.length - 1].actionType = actionType;
      try {
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}
    }
    this.recordMeaningfulAction('coach_action_executed');
  }

  public recordCoachFeedback(entry: Omit<CoachFeedbackEntry, 'id' | 'timestamp'>): CoachFeedbackEntry {
    const key = this.activeDataSource === 'REAL' ? this.REAL_COACH_KEY : this.SIM_COACH_KEY;
    const list = this.getRawCoachFeedback(key);
    const newEntry: CoachFeedbackEntry = {
      ...entry,
      id: `fb_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    list.push(newEntry);
    try {
      localStorage.setItem(key, JSON.stringify(list.slice(-100)));
    } catch {}

    if (!entry.isHelpful && entry.negativeReason === 'no_ingredients') {
      this.trackFoodRejection('ingrediente_no_disponible');
    }
    return newEntry;
  }

  // ==========================================
  // 9. WEEKLY PLAN: CREATED VS USED
  // ==========================================

  public recordWeeklyPlanEvent(event: 'PLAN_CREATED' | 'PLAN_USED', details?: string): void {
    const key = `ecoland_${this.activeDataSource.toLowerCase()}_weekly_plan_events_v1`;
    try {
      const raw = localStorage.getItem(key);
      const list: Array<{ event: string; timestamp: string; details?: string }> = raw ? JSON.parse(raw) : [];
      list.push({ event, timestamp: new Date().toISOString(), details });
      localStorage.setItem(key, JSON.stringify(list.slice(-100)));
    } catch {}

    if (event === 'PLAN_CREATED') {
      this.recordMeaningfulAction('weekly_plan_completed');
    } else {
      this.recordMeaningfulAction('weekly_plan_updated');
    }
  }

  // ==========================================
  // 10. PANTRY: USE SOON FOLLOWTHROUGH
  // ==========================================

  public recordUseSoonItemShown(itemId: string): void {
    const key = `ecoland_${this.activeDataSource.toLowerCase()}_use_soon_tracking_v1`;
    try {
      const raw = localStorage.getItem(key);
      const data: Record<string, { shownAt: string; consumed: boolean }> = raw ? JSON.parse(raw) : {};
      if (!data[itemId]) {
        data[itemId] = { shownAt: new Date().toISOString(), consumed: false };
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {}
  }

  public recordUseSoonItemConsumed(itemId: string): void {
    const key = `ecoland_${this.activeDataSource.toLowerCase()}_use_soon_tracking_v1`;
    try {
      const raw = localStorage.getItem(key);
      const data: Record<string, { shownAt: string; consumed: boolean }> = raw ? JSON.parse(raw) : {};
      if (data[itemId]) {
        data[itemId].consumed = true;
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {}
    this.recordMeaningfulAction('use_soon_item_consumed');
  }

  // ==========================================
  // 11. RECIPE IMPORT METRICS
  // ==========================================

  public startRecipeImport(): string {
    const id = `imp_${Date.now()}`;
    const key = this.REAL_IMPORTS_KEY;
    try {
      const raw = localStorage.getItem(key);
      const list: RecipeImportMetricRecord[] = raw ? JSON.parse(raw) : [];
      list.push({ id, startTime: Date.now(), status: 'started' });
      localStorage.setItem(key, JSON.stringify(list.slice(-50)));
    } catch {}
    return id;
  }

  public updateRecipeImportStatus(id: string, status: RecipeImportMetricRecord['status']): void {
    const key = this.REAL_IMPORTS_KEY;
    try {
      const raw = localStorage.getItem(key);
      const list: RecipeImportMetricRecord[] = raw ? JSON.parse(raw) : [];
      const item = list.find(i => i.id === id);
      if (item) {
        item.status = status;
        if (status === 'completed' || status === 'saved') {
          item.endTime = Date.now();
          item.durationSeconds = Math.max(1, Math.round((item.endTime - item.startTime) / 1000));
          this.recordMeaningfulAction('recipe_imported');
        }
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}
  }

  // ==========================================
  // 12. LOGGING FUNNEL & TIMERS
  // ==========================================

  public startLoggingSession(method: LogMethod = 'text'): LogFunnelRecord {
    const session: LogFunnelRecord = {
      id: `log_sess_${Date.now()}`,
      method,
      startTime: Date.now(),
      step: 'log_started'
    };
    this.currentActiveLogSession = session;
    return session;
  }

  public updateLoggingSessionStep(step: LogFunnelRecord['step'], meta?: { method?: LogMethod; wasCorrected?: boolean }): void {
    if (!this.currentActiveLogSession) {
      this.startLoggingSession(meta?.method || 'text');
    }
    if (!this.currentActiveLogSession) return;

    this.currentActiveLogSession.step = step;
    if (meta?.method) this.currentActiveLogSession.method = meta.method;
    if (meta?.wasCorrected !== undefined) this.currentActiveLogSession.wasCorrected = meta.wasCorrected;

    if (step === 'log_completed' || step === 'log_abandoned') {
      this.currentActiveLogSession.endTime = Date.now();
      this.currentActiveLogSession.durationSeconds = Math.max(
        1,
        Math.round((this.currentActiveLogSession.endTime - this.currentActiveLogSession.startTime) / 1000)
      );

      const key = this.activeDataSource === 'REAL' ? this.REAL_LOG_FUNNELS_KEY : this.SIM_LOG_FUNNELS_KEY;
      try {
        const raw = localStorage.getItem(key);
        const list: LogFunnelRecord[] = raw ? JSON.parse(raw) : [];
        list.push(this.currentActiveLogSession);
        localStorage.setItem(key, JSON.stringify(list.slice(-200)));
      } catch {}

      if (step === 'log_completed') {
        const action: MeaningfulActionType = this.currentActiveLogSession.method === 'habitual'
          ? 'habitual_meal_logged'
          : 'food_logged';
        this.recordMeaningfulAction(action);
      }

      this.currentActiveLogSession = null;
    }
  }

  // ==========================================
  // 13. FEATURE DISCOVERY
  // ==========================================

  public recordFeatureDiscovery(featureName: string): void {
    const key = `ecoland_${this.activeDataSource.toLowerCase()}_discovered_features_v1`;
    try {
      const raw = localStorage.getItem(key);
      const data: Record<string, string> = raw ? JSON.parse(raw) : {};
      if (!data[featureName]) {
        data[featureName] = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {}
  }

  // ==========================================
  // 15. SEAN ELLIS PMF TEST (N=20 FORMAT)
  // ==========================================

  public recordPMFSurveyResponse(answer: 'very_disappointed' | 'somewhat_disappointed' | 'not_disappointed'): void {
    const key = this.activeDataSource === 'REAL' ? this.REAL_PMF_KEY : this.SIM_PMF_KEY;
    try {
      const raw = localStorage.getItem(key);
      const list: Array<{ answer: string; timestamp: string }> = raw ? JSON.parse(raw) : [];
      list.push({ answer, timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }

  // ==========================================
  // REPOSITORIOS CRUD & HELPERS
  // ==========================================

  private getRawUsefulDays(mode: DataSourceMode): UsefulDayEntry[] {
    if (mode === 'REAL') {
      try {
        const raw = localStorage.getItem(this.REAL_USEFUL_DAYS_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    // SIMULATED BENCHMARK DATASET (Clearly marked synthetic data for lab testing)
    try {
      const raw = localStorage.getItem(this.SIM_USEFUL_DAYS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const simHistory: UsefulDayEntry[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isUseful = (i % 7 !== 0 && i % 7 !== 4);
      if (isUseful) {
        simHistory.push({
          date: dateStr,
          userId: `sim_user_${(i % 5) + 1}`,
          cohort: ['BIO_CUSTOMER', 'NUTRITION', 'HOUSEHOLD', 'ORGANIZATION'][i % 4] as PilotCohort,
          actionCount: (i % 3) + 1,
          actions: ['food_logged', 'coach_action_executed'],
          hadEcommercePurchase: (i === 14 || i === 28)
        });
      }
    }
    return simHistory;
  }

  private saveRawUsefulDays(days: UsefulDayEntry[], mode: DataSourceMode): void {
    const key = mode === 'REAL' ? this.REAL_USEFUL_DAYS_KEY : this.SIM_USEFUL_DAYS_KEY;
    try {
      localStorage.setItem(key, JSON.stringify(days));
    } catch {}
  }

  private getRawCoachInteractions(key: string): Array<{ id: string; timestamp: string; query: string; responseTitle: string; actionClicked: boolean; actionType?: CoachActionType }> {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (key.includes('sim')) {
      return [
        { id: 'ci_s1', timestamp: new Date().toISOString(), query: '¿Qué ceno?', responseTitle: 'Salteado rápido', actionClicked: true, actionType: 'coach_log_clicked' },
        { id: 'ci_s2', timestamp: new Date().toISOString(), query: 'Fibra', responseTitle: 'Bowl de avena', actionClicked: true, actionType: 'coach_cook_clicked' },
        { id: 'ci_s3', timestamp: new Date().toISOString(), query: 'Qué preparo', responseTitle: 'Guiso de lentejas', actionClicked: false, actionType: 'coach_no_action' }
      ];
    }
    return [];
  }

  private getRawCoachFeedback(key: string): CoachFeedbackEntry[] {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (key.includes('sim')) {
      return [
        { id: 'fb_s1', timestamp: new Date().toISOString(), query: '¿Qué ceno?', responseTitle: 'Salteado', isHelpful: true },
        { id: 'fb_s2', timestamp: new Date().toISOString(), query: 'Proteína', responseTitle: 'Hummus', isHelpful: true },
        { id: 'fb_s3', timestamp: new Date().toISOString(), query: 'Postre', responseTitle: 'Fruta', isHelpful: false, negativeReason: 'not_what_i_wanted' }
      ];
    }
    return [];
  }

  public getRecommendationPreferences(): RecommendationPreferences {
    try {
      const raw = localStorage.getItem(this.PREFERENCES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return {
      maxWeekdayCookingTimeMinutes: 20,
      dislikedFoods: [],
      preferredRecipeTypes: ['mediterranea', 'rapida', 'alta_fibra'],
      preferredBudgetLevel: 'economico',
      rejectedFoodCounts: {}
    };
  }

  public saveRecommendationPreferences(prefs: RecommendationPreferences): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(prefs));
    } catch {}
  }

  public trackFoodRejection(foodName: string): { shouldPromptExclusion: boolean; foodName: string } {
    const prefs = this.getRecommendationPreferences();
    const current = (prefs.rejectedFoodCounts[foodName] || 0) + 1;
    prefs.rejectedFoodCounts[foodName] = current;
    this.saveRecommendationPreferences(prefs);

    return {
      shouldPromptExclusion: current >= 2 && !prefs.dislikedFoods.includes(foodName),
      foodName
    };
  }

  public confirmExcludeFood(foodName: string): void {
    const prefs = this.getRecommendationPreferences();
    if (!prefs.dislikedFoods.includes(foodName)) {
      prefs.dislikedFoods.push(foodName);
      this.saveRecommendationPreferences(prefs);
    }
  }

  public getExperiments(): ControlledExperiment[] {
    try {
      const raw = localStorage.getItem(this.EXPERIMENTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return [
      {
        id: 'exp_coach_prominence',
        name: 'EcoCoach vs ¿Qué puedo hacer ahora? en /hoy',
        hypothesis: 'Mostrar "¿Qué puedo hacer ahora?" genera mayor tasa de acción inmediata sin aumentar el abandono',
        activeVariant: 'A',
        primaryMetric: 'Acciones de utilidad completadas',
        guardrailMetric: 'Tasa de rechazo / abandono (<15%)',
        startedAt: '2026-10-15',
        variantMetrics: {
          A: { sampleCount: 140, primaryValue: 46.2, guardrailAlerts: 4 },
          B: { sampleCount: 135, primaryValue: 53.8, guardrailAlerts: 3 }
        }
      },
      {
        id: 'exp_fast_food_outside',
        name: 'Preset único "Comí fuera" vs Desglose de 4 platos',
        hypothesis: 'Tener presets rápidos de menú del día reduce el tiempo de registro fuera de casa a <12s',
        activeVariant: 'B',
        primaryMetric: 'Tiempo de registro en segundos',
        guardrailMetric: 'Abandono de modal',
        startedAt: '2026-10-18',
        variantMetrics: {
          A: { sampleCount: 88, primaryValue: 19.4, guardrailAlerts: 7 },
          B: { sampleCount: 94, primaryValue: 9.8, guardrailAlerts: 2 }
        }
      }
    ];
  }

  public setExperimentVariant(experimentId: string, variant: 'A' | 'B'): void {
    const list = this.getExperiments();
    const exp = list.find(e => e.id === experimentId);
    if (exp) {
      exp.activeVariant = variant;
      try {
        localStorage.setItem(this.EXPERIMENTS_KEY, JSON.stringify(list));
      } catch {}
    }
  }

  // ==========================================
  // AGGREGATE SUMMARY: STRICT REAL VS SIMULATED
  // ==========================================

  public getAggregatedInsights(): ProductInsightsSummary {
    const isReal = this.activeDataSource === 'REAL';
    const isSim = this.activeDataSource === 'SIMULATED';

    const usefulDays = this.getRawUsefulDays(this.activeDataSource);
    const logKey = isReal ? this.REAL_LOG_FUNNELS_KEY : this.SIM_LOG_FUNNELS_KEY;
    const coachKey = isReal ? this.REAL_COACH_KEY : this.SIM_COACH_KEY;
    const coachIntKey = isReal ? this.REAL_COACH_INTERACTIONS_KEY : 'ecoland_sim_coach_interactions_v1';
    const pmfKey = isReal ? this.REAL_PMF_KEY : this.SIM_PMF_KEY;

    let logSessions: LogFunnelRecord[] = [];
    try {
      const raw = localStorage.getItem(logKey);
      if (raw) logSessions = JSON.parse(raw);
    } catch {}

    if (isSim && logSessions.length === 0) {
      logSessions = [
        { id: 's_1', method: 'habitual', startTime: 0, durationSeconds: 2, step: 'log_completed' },
        { id: 's_2', method: 'voice', startTime: 0, durationSeconds: 7, step: 'log_completed' },
        { id: 's_3', method: 'photo', startTime: 0, durationSeconds: 9, step: 'log_completed' },
        { id: 's_4', method: 'text', startTime: 0, durationSeconds: 14, step: 'log_completed' },
        { id: 's_5', method: 'EAN', startTime: 0, durationSeconds: 4, step: 'log_completed' },
        { id: 's_6', method: 'eating_out', startTime: 0, durationSeconds: 11, step: 'log_completed' },
        { id: 's_7', method: 'search', startTime: 0, durationSeconds: 18, step: 'log_abandoned' }
      ];
    }

    const totalLogStarted = logSessions.length;
    const completedLogSessions = logSessions.filter(s => s.step === 'log_completed');
    const totalLogCompleted = completedLogSessions.length;
    const logCompletionRate: SampleMetric = {
      numerator: totalLogCompleted,
      denominator: Math.max(1, totalLogStarted),
      percentage: totalLogStarted > 0 ? Math.round((totalLogCompleted / totalLogStarted) * 100) : 0,
      formatted: `${totalLogCompleted}/${Math.max(1, totalLogStarted)} (${totalLogStarted > 0 ? Math.round((totalLogCompleted / totalLogStarted) * 100) : 0}%)`
    };

    const durations = completedLogSessions.map(s => s.durationSeconds || 10).sort((a, b) => a - b);
    const medianDurationSeconds = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;

    const durationDistribution = {
      under5s: durations.filter(d => d < 5).length,
      from5to10s: durations.filter(d => d >= 5 && d < 10).length,
      from10to20s: durations.filter(d => d >= 10 && d < 20).length,
      from20to40s: durations.filter(d => d >= 20 && d < 40).length,
      over40s: durations.filter(d => d >= 40).length
    };

    const allMethods: LogMethod[] = ['habitual', 'repeat', 'search', 'EAN', 'text', 'voice', 'photo', 'eating_out'];
    const byMethod: Record<LogMethod, { count: number; medianSeconds: number; correctionRate: number; abandonmentRate: number }> = {} as any;
    for (const m of allMethods) {
      const mSessions = logSessions.filter(s => s.method === m);
      const mCompleted = mSessions.filter(s => s.step === 'log_completed');
      const mCorrected = mSessions.filter(s => s.wasCorrected);
      const mDurs = mCompleted.map(s => s.durationSeconds || 10).sort((a, b) => a - b);
      byMethod[m] = {
        count: mSessions.length,
        medianSeconds: mDurs.length > 0 ? mDurs[Math.floor(mDurs.length / 2)] : 0,
        correctionRate: mSessions.length > 0 ? Math.round((mCorrected.length / mSessions.length) * 100) : 0,
        abandonmentRate: mSessions.length > 0 ? Math.round(((mSessions.length - mCompleted.length) / mSessions.length) * 100) : 0
      };
    }

    // Coach
    const coachInteractions = this.getRawCoachInteractions(coachIntKey);
    const responsesShown = coachInteractions.length;
    const actionsExecuted = coachInteractions.filter(c => c.actionClicked).length;
    const coachActionRate: SampleMetric = {
      numerator: actionsExecuted,
      denominator: Math.max(1, responsesShown),
      percentage: responsesShown > 0 ? Math.round((actionsExecuted / responsesShown) * 100) : 0,
      formatted: `${actionsExecuted}/${Math.max(1, responsesShown)} (${responsesShown > 0 ? Math.round((actionsExecuted / responsesShown) * 100) : 0}%)`
    };

    const coachFeedbackList = this.getRawCoachFeedback(coachKey);
    const helpfulCount = coachFeedbackList.filter(f => f.isHelpful).length;
    const helpfulRatio: SampleMetric = {
      numerator: helpfulCount,
      denominator: Math.max(1, coachFeedbackList.length),
      percentage: coachFeedbackList.length > 0 ? Math.round((helpfulCount / coachFeedbackList.length) * 100) : 0,
      formatted: `${helpfulCount}/${Math.max(1, coachFeedbackList.length)} (${coachFeedbackList.length > 0 ? Math.round((helpfulCount / coachFeedbackList.length) * 100) : 0}%)`
    };

    const negativeReasonsBreakdown: Record<string, number> = {};
    for (const f of coachFeedbackList) {
      if (!f.isHelpful && f.negativeReason) {
        negativeReasonsBreakdown[f.negativeReason] = (negativeReasonsBreakdown[f.negativeReason] || 0) + 1;
      }
    }

    // Coach Reuse Rate 7d
    const coachReuseRate: SampleMetric = isSim 
      ? { numerator: 8, denominator: 14, percentage: 57, formatted: '8/14 (57.1%)' }
      : { numerator: 0, denominator: Math.max(1, responsesShown > 0 ? 1 : 0), percentage: 0, formatted: '0/0 (En curso)' };

    // Decisions Saved
    const decisionRecords = this.getDecisionSavedRecords();
    const yesAnswers = decisionRecords.filter(d => d.answer === 'yes').length;
    const decisionRatio: SampleMetric = {
      numerator: yesAnswers,
      denominator: Math.max(1, decisionRecords.length),
      percentage: decisionRecords.length > 0 ? Math.round((yesAnswers / decisionRecords.length) * 100) : 0,
      formatted: `${yesAnswers}/${Math.max(1, decisionRecords.length)} (${decisionRecords.length > 0 ? Math.round((yesAnswers / decisionRecords.length) * 100) : 0}%)`
    };

    // Useful days per week
    const last7Days: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    const matchingDays = usefulDays.filter(h => last7Days.includes(h.date) && h.actionCount >= 1);
    const avgUsefulDays = isSim ? 3.8 : (matchingDays.length > 0 ? matchingDays.length : 0);

    // Non-commerce retention with n/N
    const nonCommerceDays = usefulDays.filter(h => !h.hadEcommercePurchase && h.actionCount >= 1);
    const eligibleUsers = isSim ? 20 : (usefulDays.length > 0 ? 1 : 0);

    const nonCommerceRetention = {
      d1: isSim 
        ? { numerator: 14, denominator: 20, percentage: 70, formatted: '14/20 (70.0%)' }
        : { numerator: nonCommerceDays.length > 0 ? 1 : 0, denominator: Math.max(1, eligibleUsers), percentage: eligibleUsers > 0 ? 100 : 0, formatted: `${nonCommerceDays.length > 0 ? 1 : 0}/${Math.max(1, eligibleUsers)}` },
      d7: isSim
        ? { numerator: 9, denominator: 20, percentage: 45, formatted: '9/20 (45.0%)' }
        : { numerator: 0, denominator: Math.max(1, eligibleUsers), percentage: 0, formatted: '0/20 (Día 0)' },
      d14: isSim
        ? { numerator: 8, denominator: 20, percentage: 40, formatted: '8/20 (40.0%)' }
        : { numerator: 0, denominator: Math.max(1, eligibleUsers), percentage: 0, formatted: '0/20 (Día 0)' },
      d30: isSim
        ? { numerator: 6, denominator: 20, percentage: 30, formatted: '6/20 (30.0%)' }
        : { numerator: 0, denominator: Math.max(1, eligibleUsers), percentage: 0, formatted: '0/20 (Día 0)' }
    };

    // Time to First Value
    let firstValRecord: { durationSeconds: number; firstValueType: FirstValueType } | null = null;
    try {
      const raw = localStorage.getItem(this.REAL_FIRST_VALUE_KEY);
      if (raw) firstValRecord = JSON.parse(raw);
    } catch {}

    const firstValDuration = firstValRecord?.durationSeconds || (isSim ? 45 : 0);
    const ttfvBuckets = isSim
      ? { under30s: 6, from30to60s: 8, from1to2m: 4, from2to5m: 2, over5m: 0 }
      : {
          under30s: firstValDuration > 0 && firstValDuration < 30 ? 1 : 0,
          from30to60s: firstValDuration >= 30 && firstValDuration < 60 ? 1 : 0,
          from1to2m: firstValDuration >= 60 && firstValDuration < 120 ? 1 : 0,
          from2to5m: firstValDuration >= 120 && firstValDuration < 300 ? 1 : 0,
          over5m: firstValDuration >= 300 ? 1 : 0
        };

    const firstValDistribution: Record<FirstValueType, number> = isSim
      ? { FOOD_LOGGING: 8, COACH: 5, PANTRY: 3, WEEK_PLAN: 2, SHOPPING_LIST: 1, RECIPE: 1, HOUSEHOLD: 0 }
      : {
          FOOD_LOGGING: firstValRecord?.firstValueType === 'FOOD_LOGGING' ? 1 : 0,
          COACH: firstValRecord?.firstValueType === 'COACH' ? 1 : 0,
          PANTRY: firstValRecord?.firstValueType === 'PANTRY' ? 1 : 0,
          WEEK_PLAN: firstValRecord?.firstValueType === 'WEEK_PLAN' ? 1 : 0,
          SHOPPING_LIST: firstValRecord?.firstValueType === 'SHOPPING_LIST' ? 1 : 0,
          RECIPE: firstValRecord?.firstValueType === 'RECIPE' ? 1 : 0,
          HOUSEHOLD: firstValRecord?.firstValueType === 'HOUSEHOLD' ? 1 : 0
        };

    // PMF Survey Score
    let pmfResponses: Array<{ answer: string; timestamp: string }> = [];
    try {
      const raw = localStorage.getItem(pmfKey);
      if (raw) pmfResponses = JSON.parse(raw);
    } catch {}

    if (isSim && pmfResponses.length === 0) {
      pmfResponses = [
        { answer: 'very_disappointed', timestamp: '2026-10-20' },
        { answer: 'very_disappointed', timestamp: '2026-10-21' },
        { answer: 'very_disappointed', timestamp: '2026-10-22' },
        { answer: 'very_disappointed', timestamp: '2026-10-23' },
        { answer: 'very_disappointed', timestamp: '2026-10-24' },
        { answer: 'very_disappointed', timestamp: '2026-10-25' },
        { answer: 'very_disappointed', timestamp: '2026-10-26' },
        { answer: 'very_disappointed', timestamp: '2026-10-27' },
        { answer: 'very_disappointed', timestamp: '2026-10-28' }, // 9/20 = 45%
        { answer: 'somewhat_disappointed', timestamp: '2026-10-21' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-22' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-23' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-24' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-25' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-26' },
        { answer: 'somewhat_disappointed', timestamp: '2026-10-27' }, // 7/20 = 35%
        { answer: 'not_disappointed', timestamp: '2026-10-22' },
        { answer: 'not_disappointed', timestamp: '2026-10-23' },
        { answer: 'not_disappointed', timestamp: '2026-10-25' },
        { answer: 'not_disappointed', timestamp: '2026-10-27' } // 4/20 = 20%
      ];
    }

    const totalPmf = pmfResponses.length;
    const vDis = pmfResponses.filter(p => p.answer === 'very_disappointed').length;
    const sDis = pmfResponses.filter(p => p.answer === 'somewhat_disappointed').length;
    const nDis = pmfResponses.filter(p => p.answer === 'not_disappointed').length;

    const pmfVery: SampleMetric = {
      numerator: vDis,
      denominator: Math.max(1, totalPmf),
      percentage: totalPmf > 0 ? Math.round((vDis / totalPmf) * 100) : 0,
      formatted: `${vDis}/${Math.max(1, totalPmf)} (${totalPmf > 0 ? Math.round((vDis / totalPmf) * 100) : 0}%)`
    };

    const pmfSomewhat: SampleMetric = {
      numerator: sDis,
      denominator: Math.max(1, totalPmf),
      percentage: totalPmf > 0 ? Math.round((sDis / totalPmf) * 100) : 0,
      formatted: `${sDis}/${Math.max(1, totalPmf)} (${totalPmf > 0 ? Math.round((sDis / totalPmf) * 100) : 0}%)`
    };

    const pmfNot: SampleMetric = {
      numerator: nDis,
      denominator: Math.max(1, totalPmf),
      percentage: totalPmf > 0 ? Math.round((nDis / totalPmf) * 100) : 0,
      formatted: `${nDis}/${Math.max(1, totalPmf)} (${totalPmf > 0 ? Math.round((nDis / totalPmf) * 100) : 0}%)`
    };

    // Recipe imports
    let importList: RecipeImportMetricRecord[] = [];
    try {
      const raw = localStorage.getItem(this.REAL_IMPORTS_KEY);
      if (raw) importList = JSON.parse(raw);
    } catch {}

    const completedImports = importList.filter(i => i.status === 'completed' || i.status === 'saved');
    const importCompRate: SampleMetric = isSim
      ? { numerator: 11, denominator: 14, percentage: 78, formatted: '11/14 (78.5%)' }
      : {
          numerator: completedImports.length,
          denominator: Math.max(1, importList.length),
          percentage: importList.length > 0 ? Math.round((completedImports.length / importList.length) * 100) : 0,
          formatted: `${completedImports.length}/${Math.max(1, importList.length)} (${importList.length > 0 ? Math.round((completedImports.length / importList.length) * 100) : 0}%)`
        };

    const importDurs = completedImports.map(i => i.durationSeconds || 15).sort((a, b) => a - b);
    const medianImportSeconds = isSim ? 24 : (importDurs.length > 0 ? importDurs[Math.floor(importDurs.length / 2)] : 0);

    return {
      dataSource: this.activeDataSource,
      pilotStatus: isReal ? 'PILOT_IN_PROGRESS' : (isSim ? 'SIMULATED_BENCHMARK' : 'TEST_MODE'),
      pilotDay: isReal ? 0 : 30,
      cohorts: {
        BIO_CUSTOMER: { targetUsers: 5, activeUsers: isReal ? 0 : 5 },
        NUTRITION: { targetUsers: 5, activeUsers: isReal ? 0 : 5 },
        HOUSEHOLD: { targetUsers: 5, activeUsers: isReal ? 0 : 5 },
        ORGANIZATION: { targetUsers: 5, activeUsers: isReal ? 0 : 5 }
      },
      sampleSize: {
        totalTargetUsers: 20,
        enrolledUsers: isReal ? 0 : 20,
        activeUsers: isReal ? (usefulDays.length > 0 ? 1 : 0) : 18,
        dropoutUsers: isReal ? 0 : 2
      },
      usefulDaysPerWeek: {
        average: avgUsefulDays,
        formatted: isReal ? `${avgUsefulDays} días / sem (N=1 local)` : '3.8 días / sem (Simulado)'
      },
      timeToFirstValue: {
        medianSeconds: firstValDuration || (isSim ? 45 : 0),
        buckets: ttfvBuckets,
        firstValueDistribution: firstValDistribution
      },
      nonCommerceRetention,
      loggingFunnel: {
        totalStarted: totalLogStarted,
        totalCompleted: totalLogCompleted,
        completionRate: logCompletionRate,
        medianDurationSeconds,
        durationDistribution,
        byMethod
      },
      coachMetrics: {
        responsesShown,
        actionsExecuted,
        actionRate: coachActionRate,
        reuseRate7Days: coachReuseRate,
        helpfulRatio,
        negativeReasonsBreakdown
      },
      decisionSaved: {
        totalPrompted: decisionRecords.length,
        answers: {
          yes: yesAnswers,
          somewhat: decisionRecords.filter(d => d.answer === 'somewhat').length,
          no: decisionRecords.filter(d => d.answer === 'no').length
        },
        savedRatio: decisionRatio
      },
      weeklyPlanMetrics: {
        plansCreated: isSim ? 12 : 0,
        plansUsed: isSim ? 9 : 0,
        followthroughRate: isSim 
          ? { numerator: 9, denominator: 12, percentage: 75, formatted: '9/12 (75.0%)' }
          : { numerator: 0, denominator: 1, percentage: 0, formatted: '0/0 (En curso)' }
      },
      pantryMetrics: {
        useSoonItemsShown: isSim ? 24 : 0,
        useSoonItemsConsumed: isSim ? 18 : 0,
        useSoonFollowthroughRate: isSim
          ? { numerator: 18, denominator: 24, percentage: 75, formatted: '18/24 (75.0%)' }
          : { numerator: 0, denominator: 1, percentage: 0, formatted: '0/0 (En curso)' }
      },
      recipeImportMetrics: {
        totalStarted: isSim ? 14 : importList.length,
        totalCompleted: isSim ? 11 : completedImports.length,
        completionRate: importCompRate,
        medianSeconds: medianImportSeconds
      },
      discoveredFeatures: isSim 
        ? { 'despensa': 19, 'hoy': 20, 'coach': 16, 'semana': 12, 'lista': 14 }
        : {},
      simpleModeVsNutrition: {
        simpleModeCount: isSim ? 11 : 1,
        nutritionModeCount: isSim ? 9 : 0,
        switchesToSimple: isSim ? 2 : 0,
        switchesToNutrition: isSim ? 1 : 0,
        simpleRetentionDays: isSim ? 4.2 : 0,
        nutritionRetentionDays: isSim ? 3.4 : 0
      },
      pmfSurveyScore: {
        veryDisappointed: pmfVery,
        somewhatDisappointed: pmfSomewhat,
        notDisappointed: pmfNot,
        totalResponses: totalPmf,
        pmfSignalAchieved: totalPmf >= 20 && pmfVery.percentage >= 40
      }
    };
  }
}

export const productInsightsService = new ProductInsightsService();
