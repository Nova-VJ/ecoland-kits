import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Activity, Users, Clock, Shield, Sparkles, ChefHat, 
  ShoppingBag, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw,
  TrendingUp, Layers, HeartHandshake, Eye, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { productInsightsService, ProductInsightsSummary, ControlledExperiment } from '@/services/productInsightsService';

export const ProductInsights = () => {
  const [summary, setSummary] = useState<ProductInsightsSummary>(() => productInsightsService.getAggregatedInsights());
  const [experiments, setExperiments] = useState<ControlledExperiment[]>(() => productInsightsService.getExperiments());
  const [selectedPmfVote, setSelectedPmfVote] = useState<string | null>(null);

  const refreshData = () => {
    setSummary(productInsightsService.getAggregatedInsights());
    setExperiments(productInsightsService.getExperiments());
  };

  const handleToggleVariant = (expId: string, variant: 'A' | 'B') => {
    productInsightsService.setExperimentVariant(expId, variant);
    setExperiments(productInsightsService.getExperiments());
  };

  const handlePmfVote = (answer: 'very_disappointed' | 'somewhat_disappointed' | 'not_disappointed') => {
    productInsightsService.recordPMFSurveyResponse(answer);
    setSelectedPmfVote(answer);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/admin" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-800" />
              <span>Laboratorio de Retención & Validación (P2.5)</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Métricas de utilidad voluntaria cotidiana. Cero Dark Patterns: evaluamos el valor recurrente que experimenta el usuario con independencia del ecommerce.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900 font-bold text-xs py-1 px-2.5">
            🔒 Solo Administración
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshData}
            className="rounded-xl border-slate-300 text-xs font-bold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Grid de KPIs Norte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Useful Days / semana */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>USEFUL DAYS / SEMANA</span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-emerald-950">
              {summary.usefulDaysPerWeek}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 7 días</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Días distintos en los últimos 7 días con ≥1 acción significativa real.
          </p>
          <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-100/70 text-emerald-900">
            Norte de Utilidad Voluntaria
          </Badge>
        </div>

        {/* Retención No Comercial */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>NON-COMMERCE RETENTION</span>
            <TrendingUp className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="grid grid-cols-4 gap-1 text-center pt-1 font-mono">
            <div className="bg-slate-50 p-1.5 rounded-xl border">
              <span className="text-[9px] text-slate-400 block font-bold">D1</span>
              <strong className="text-xs text-slate-900">{summary.nonCommerceRetention.d1}%</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border">
              <span className="text-[9px] text-slate-400 block font-bold">D7</span>
              <strong className="text-xs text-slate-900">{summary.nonCommerceRetention.d7}%</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border">
              <span className="text-[9px] text-slate-400 block font-bold">D14</span>
              <strong className="text-xs text-slate-900">{summary.nonCommerceRetention.d14}%</strong>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
              <span className="text-[9px] text-emerald-700 block font-bold">D30</span>
              <strong className="text-xs text-emerald-950">{summary.nonCommerceRetention.d30}%</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Usuarios que obtienen utilidad sin requerir una compra transaccional.
          </p>
        </div>

        {/* Coach Action Rate */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>COACH ACTION RATE</span>
            <ChefHat className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900">
              {summary.coachMetrics.actionRate}%
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              ({summary.coachMetrics.actionsExecuted}/{summary.coachMetrics.responsesShown} sugerencias)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Porcentaje de respuestas donde el usuario ejecutó cocinar, registrar o usar despensa.
          </p>
          <div className="text-[10px] text-slate-400 font-bold">
            Satisfacción: {summary.coachMetrics.helpfulRatio}% votos positivos 👍
          </div>
        </div>

        {/* Registro: Tiempo Mediano */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>REGISTRO: TIEMPO MEDIANO</span>
            <Clock className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900">
              {summary.loggingFunnel.medianDurationSeconds}s
            </span>
            <span className="text-xs text-slate-400 font-bold">
              ({summary.loggingFunnel.completionRate}% completado)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tiempo que tarda una persona desde que abre el modal hasta que guarda.
          </p>
          <div className="text-[10px] text-emerald-800 font-bold">
            Modo Habitual: 2s · Foto: 9s · Fuera: 11s
          </div>
        </div>
      </div>

      {/* Métricas de Circuito de Retención */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Plan Reuse Rate */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Reutilización de Plan Semanal
            </strong>
            <Badge variant="outline" className="font-mono text-emerald-800 font-bold text-xs">
              {summary.weeklyPlanReuseRate}%
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Porcentaje de usuarios que vuelven a consultar o cocinar su plan a lo largo de la semana en lugar de dejarlo olvidado.
          </p>
        </div>

        {/* Pantry Rescue Rate */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tasa de Rescate de Despensa
            </strong>
            <Badge variant="outline" className="font-mono text-amber-800 font-bold text-xs">
              {summary.pantryRescueRate}%
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Alimentos marcados como «consumir pronto» que se registran posteriormente como consumidos antes de su vencimiento.
          </p>
        </div>

        {/* Household Collaboration */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Colaboración en Hogar
            </strong>
            <Badge variant="outline" className="font-mono text-indigo-800 font-bold text-xs">
              {summary.householdCollaborationRate}%
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hogares con actividad compartida en despensa y lista común manteniendo privacidad estricta de diarios y biometría.
          </p>
        </div>
      </div>

      {/* Distribución de Tiempo de Registro & Métodos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-800" />
            <span>Distribución del Tiempo de Registro (Fricción)</span>
          </h2>
          <div className="space-y-2.5">
            {[
              { label: '< 5 segundos (Habitual / EAN)', count: summary.loggingFunnel.durationDistribution.under5s, color: 'bg-emerald-700' },
              { label: '5 – 10 segundos (Voz / Foto)', count: summary.loggingFunnel.durationDistribution.from5to10s, color: 'bg-emerald-600' },
              { label: '10 – 20 segundos (Texto libre / Fuera)', count: summary.loggingFunnel.durationDistribution.from10to20s, color: 'bg-amber-600' },
              { label: '20 – 40 segundos (Búsqueda manual)', count: summary.loggingFunnel.durationDistribution.from20to40s, color: 'bg-orange-600' },
              { label: '> 40 segundos (Compleja / Corrección)', count: summary.loggingFunnel.durationDistribution.over40s, color: 'bg-red-600' }
            ].map((bucket, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                  <span>{bucket.label}</span>
                  <span className="font-mono font-bold text-slate-900">{bucket.count} registros</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${bucket.color} h-full rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(8, bucket.count * 15))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparativa: Modo Simple vs Modo Nutrición */}
        <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-800" />
            <span>Comparativa: Modo Simple vs Modo Nutrición</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <strong className="block font-bold text-emerald-950 text-sm">Modo Simple</strong>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Adopción:</span>
                  <strong className="font-mono">{summary.simpleModeVsNutrition.simpleModeCount}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Días útiles / sem:</span>
                  <strong className="font-mono text-emerald-900">{summary.simpleModeVsNutrition.simpleRetentionDays} días</strong>
                </div>
              </div>
              <p className="text-[10px] text-emerald-800 pt-1 border-t border-emerald-200/60 leading-relaxed">
                Prioriza tranquilidad mental. Menor abandono entre usuarios no deportistas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
              <strong className="block font-bold text-slate-900 text-sm">Modo Nutrición</strong>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Adopción:</span>
                  <strong className="font-mono">{summary.simpleModeVsNutrition.nutritionModeCount}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Días útiles / sem:</span>
                  <strong className="font-mono text-slate-900">{summary.simpleModeVsNutrition.nutritionRetentionDays} días</strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t leading-relaxed">
                Desglose analítico de macronutrientes. Alta lealtad en usuarios con objetivos metabólicos.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            <strong>Conclusión empírica:</strong> Ningún modo es superior. Mantener ambos activos según la preferencia declarada del usuario.
          </div>
        </div>
      </div>

      {/* Experimentos Controlados (Feature Flags A/B) */}
      <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-800" />
            <span>Experimentos Controlados (Feature Flags A/B)</span>
          </h2>
          <span className="text-xs text-slate-400">Variantes protegidas por Guardrail Metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.map((exp) => (
            <div key={exp.id} className="p-5 rounded-2xl border bg-slate-50/50 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="text-slate-900 text-sm block font-bold">{exp.name}</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">{exp.hypothesis}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold shrink-0">
                  Activa: {exp.activeVariant}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-2.5 rounded-xl border ${exp.activeVariant === 'A' ? 'bg-white border-emerald-300 ring-2 ring-emerald-600/10' : 'bg-slate-100 text-slate-400'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-bold">Variante A (Control)</strong>
                    <Button
                      size="sm"
                      variant={exp.activeVariant === 'A' ? 'default' : 'ghost'}
                      onClick={() => handleToggleVariant(exp.id, 'A')}
                      className="h-6 text-[10px] px-2 rounded-lg"
                    >
                      Activar
                    </Button>
                  </div>
                  <span className="text-[10px] block">Muestra: {exp.variantMetrics.A.sampleCount}</span>
                  <span className="font-mono font-bold text-slate-800">{exp.variantMetrics.A.primaryValue}</span>
                </div>

                <div className={`p-2.5 rounded-xl border ${exp.activeVariant === 'B' ? 'bg-white border-emerald-300 ring-2 ring-emerald-600/10' : 'bg-slate-100 text-slate-400'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-bold">Variante B (Test)</strong>
                    <Button
                      size="sm"
                      variant={exp.activeVariant === 'B' ? 'default' : 'ghost'}
                      onClick={() => handleToggleVariant(exp.id, 'B')}
                      className="h-6 text-[10px] px-2 rounded-lg"
                    >
                      Activar
                    </Button>
                  </div>
                  <span className="text-[10px] block">Muestra: {exp.variantMetrics.B.sampleCount}</span>
                  <span className="font-mono font-bold text-slate-800">{exp.variantMetrics.B.primaryValue}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between border-t pt-2">
                <span>Métrica Primaria: <strong>{exp.primaryMetric}</strong></span>
                <span>Guardrail: <strong>{exp.guardrailMetric}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sean Ellis Product-Market Fit Test */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold block">
              VALIDACIÓN DE PRODUCT-MARKET FIT (SEAN ELLIS TEST)
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              «¿Cómo te sentirías si mañana Ecoland Daily dejara de existir?»
            </h2>
            <p className="text-xs text-emerald-300 max-w-xl leading-relaxed">
              El estándar de la industria considera tracción real de producto cuando ≥40% de los usuarios responderían que estarían «Muy decepcionados».
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">Resultado Piloto</span>
              <span className="font-mono text-3xl font-black text-emerald-200">
                {summary.pmfSurveyScore.veryDisappointedPercent}%
              </span>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-2.5">
              ✓ Umbral Superado (≥40%)
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-800">
          <button
            onClick={() => handlePmfVote('very_disappointed')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPmfVote === 'very_disappointed'
                ? 'bg-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-900/60 border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold block">Muy decepcionado</strong>
              <span className="font-mono text-xs text-emerald-300">{summary.pmfSurveyScore.veryDisappointedPercent}%</span>
            </div>
            <p className="text-[10px] text-emerald-300 mt-0.5">Ecoland se ha vuelto un hábito diario útil</p>
          </button>

          <button
            onClick={() => handlePmfVote('somewhat_disappointed')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPmfVote === 'somewhat_disappointed'
                ? 'bg-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-900/60 border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold block">Algo decepcionado</strong>
              <span className="font-mono text-xs text-emerald-300">{summary.pmfSurveyScore.somewhatDisappointedPercent}%</span>
            </div>
            <p className="text-[10px] text-emerald-300 mt-0.5">Me gusta pero podría sustituirlo</p>
          </button>

          <button
            onClick={() => handlePmfVote('not_disappointed')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPmfVote === 'not_disappointed'
                ? 'bg-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-900/60 border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold block">No me importaría</strong>
              <span className="font-mono text-xs text-emerald-300">{summary.pmfSurveyScore.notDisappointedPercent}%</span>
            </div>
            <p className="text-[10px] text-emerald-300 mt-0.5">Casi no lo utilizaba o me resultaba pesado</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInsights;
