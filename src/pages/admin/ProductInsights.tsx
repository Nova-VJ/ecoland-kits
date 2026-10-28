import { useState } from 'react';
import { 
  Activity, Clock, Sparkles, ChefHat, 
  ArrowLeft, RefreshCw,
  TrendingUp, Layers, Award, AlertCircle, Database, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  productInsightsService, 
  ProductInsightsSummary, 
  ControlledExperiment,
  DataSourceMode
} from '@/services/productInsightsService';

export const ProductInsights = () => {
  const [dataSource, setDataSource] = useState<DataSourceMode>(() => productInsightsService.getDataSource());
  const [summary, setSummary] = useState<ProductInsightsSummary>(() => productInsightsService.getAggregatedInsights());
  const [experiments, setExperiments] = useState<ControlledExperiment[]>(() => productInsightsService.getExperiments());
  const [selectedPmfVote, setSelectedPmfVote] = useState<string | null>(null);

  const handleSelectDataSource = (source: DataSourceMode) => {
    productInsightsService.setDataSource(source);
    setDataSource(source);
    setSummary(productInsightsService.getAggregatedInsights());
  };

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

  const handleDecisionVote = (answer: 'yes' | 'somewhat' | 'no') => {
    productInsightsService.recordDecisionSavedFeedback('coach', answer);
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
              <span>Laboratorio de Validación & Piloto Real (P2.5B)</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Telemetría de utilidad voluntaria cotidiana. Sin Dark Patterns ni rachas punitivas. Toda métrica se reporta con tamaño muestral explícito (n/N).
          </p>
        </div>

        {/* SELECTOR DE DATA SOURCE OBLIGATORIO */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border">
            <span className="text-[10px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>FUENTE:</span>
            </span>
            <Button
              size="sm"
              variant={dataSource === 'REAL' ? 'default' : 'ghost'}
              onClick={() => handleSelectDataSource('REAL')}
              className={`text-xs font-bold rounded-xl h-8 px-3 ${dataSource === 'REAL' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
            >
              REAL (Piloto N=20)
            </Button>
            <Button
              size="sm"
              variant={dataSource === 'SIMULATED' ? 'default' : 'ghost'}
              onClick={() => handleSelectDataSource('SIMULATED')}
              className={`text-xs font-bold rounded-xl h-8 px-3 ${dataSource === 'SIMULATED' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
            >
              SIMULACIÓN (Sintético)
            </Button>
            <Button
              size="sm"
              variant={dataSource === 'TEST' ? 'default' : 'ghost'}
              onClick={() => handleSelectDataSource('TEST')}
              className={`text-xs font-bold rounded-xl h-8 px-3 ${dataSource === 'TEST' ? 'bg-indigo-700 text-white' : 'text-slate-600'}`}
            >
              TEST
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshData}
            className="rounded-xl border-slate-300 text-xs font-bold gap-1.5 h-8"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* BANNER DE ESTADO SEGÚN DATA SOURCE */}
      {dataSource === 'REAL' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 animate-pulse" />
          <div className="space-y-0.5 text-xs text-emerald-950">
            <strong className="font-bold text-emerald-900 block text-sm">
              PILOTO REAL EN CURSO (DÍA {summary.pilotDay}/30) — MUESTRA OBJETIVO: 20 USUARIOS
            </strong>
            <p className="text-emerald-800 leading-relaxed">
              Visualizando datos de telemetría de usuarios reales. Los valores reflejan únicamente acciones ejecutadas voluntariamente. Si un usuario aún no ha alcanzado un hito (ej. D7 o D30), se muestra formalmente como 0/N para no falsear resultados.
            </p>
          </div>
        </div>
      )}

      {dataSource === 'SIMULATED' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-amber-950">
            <strong className="font-bold text-amber-900 block text-sm">
              ⚠️ ATENCIÓN: VISUALIZANDO DATOS DE SIMULACIÓN Y LABORATORIO SINTÉTICO
            </strong>
            <p className="text-amber-800 leading-relaxed">
              Estos valores proceden de modelos de calibración y pruebas de código automatizadas. NO corresponden a usuarios humanos reales y NO deben utilizarse para tomar decisiones estratégicas de producto ni dar por validado el Product-Market Fit.
            </p>
          </div>
        </div>
      )}

      {/* COHORTES DEL PILOTO N=20 */}
      <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wider">Muestra del Piloto (N=20 Participantes Cualitativos)</span>
          <span className="text-slate-400 font-mono">
            {summary.sampleSize.activeUsers}/{summary.sampleSize.totalTargetUsers} Activos
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'BIO_CUSTOMER', name: 'Cliente Ecológico', desc: '5 clientes habituales de tienda' },
            { id: 'NUTRITION', name: 'Nutrición / Deporte', desc: '5 enfocados en macros y salud' },
            { id: 'HOUSEHOLD', name: 'Hogar / Familia', desc: '5 usuarios con despensa compartida' },
            { id: 'ORGANIZATION', name: 'Organización / Desperdicio', desc: '5 enfocados en ahorro y despensa' }
          ].map((coh) => (
            <div key={coh.id} className="p-3 bg-slate-50 rounded-2xl border space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-slate-900">{coh.name}</strong>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {summary.cohorts[coh.id as keyof typeof summary.cohorts].activeUsers}/5
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500">{coh.desc}</p>
            </div>
          ))}
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
              {summary.usefulDaysPerWeek.average}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 7 días</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Días con ≥1 acción significativa voluntaria.
          </p>
          <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-100/70 text-emerald-900 font-mono">
            {summary.usefulDaysPerWeek.formatted}
          </Badge>
        </div>

        {/* Retención No Comercial */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>NON-COMMERCE RETENTION</span>
            <TrendingUp className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="grid grid-cols-4 gap-1 text-center pt-1 font-mono">
            <div className="bg-slate-50 p-1 rounded-xl border">
              <span className="text-[8px] text-slate-400 block font-bold">D1</span>
              <strong className="text-[10px] text-slate-900 block">{summary.nonCommerceRetention.d1.percentage}%</strong>
              <span className="text-[8px] text-slate-400">{summary.nonCommerceRetention.d1.numerator}/{summary.nonCommerceRetention.d1.denominator}</span>
            </div>
            <div className="bg-slate-50 p-1 rounded-xl border">
              <span className="text-[8px] text-slate-400 block font-bold">D7</span>
              <strong className="text-[10px] text-slate-900 block">{summary.nonCommerceRetention.d7.percentage}%</strong>
              <span className="text-[8px] text-slate-400">{summary.nonCommerceRetention.d7.numerator}/{summary.nonCommerceRetention.d7.denominator}</span>
            </div>
            <div className="bg-slate-50 p-1 rounded-xl border">
              <span className="text-[8px] text-slate-400 block font-bold">D14</span>
              <strong className="text-[10px] text-slate-900 block">{summary.nonCommerceRetention.d14.percentage}%</strong>
              <span className="text-[8px] text-slate-400">{summary.nonCommerceRetention.d14.numerator}/{summary.nonCommerceRetention.d14.denominator}</span>
            </div>
            <div className="bg-emerald-50 p-1 rounded-xl border border-emerald-200">
              <span className="text-[8px] text-emerald-700 block font-bold">D30</span>
              <strong className="text-[10px] text-emerald-950 block">{summary.nonCommerceRetention.d30.percentage}%</strong>
              <span className="text-[8px] text-emerald-700">{summary.nonCommerceRetention.d30.numerator}/{summary.nonCommerceRetention.d30.denominator}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Retorno con acción útil sin requerir compras.
          </p>
        </div>

        {/* Coach Action Rate & Reuse */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>ECOCOACH ACCIÓN & REUSO</span>
            <ChefHat className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900">
              {summary.coachMetrics.actionRate.percentage}%
            </span>
            <span className="text-xs text-emerald-700 font-bold font-mono">
              ({summary.coachMetrics.actionRate.formatted})
            </span>
          </div>
          <div className="text-[11px] text-slate-600 flex justify-between border-t pt-1">
            <span>Reuso a 7 días:</span>
            <strong className="font-mono text-slate-900">{summary.coachMetrics.reuseRate7Days.formatted}</strong>
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            Satisfacción: {summary.coachMetrics.helpfulRatio.formatted} votos 👍
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
            <span className="text-xs text-slate-400 font-bold font-mono">
              ({summary.loggingFunnel.completionRate.formatted})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tiempo mediano desde inicio de registro a guardado.
          </p>
          <div className="text-[10px] text-emerald-800 font-bold">
            Habitual: 2s · Comer fuera: 11s
          </div>
        </div>
      </div>

      {/* TIME TO FIRST VALUE & PRIMER MOMENTO DE VALOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>Time to First Value (TTFV)</span>
            </h2>
            <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-800">
              Mediana: {summary.timeToFirstValue.medianSeconds}s
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Tiempo transcurrido desde que el usuario abre la app por primera vez hasta que ejecuta su primera acción útil real.
          </p>
          <div className="space-y-2">
            {[
              { label: '< 30 segundos (Valor Inmediato)', count: summary.timeToFirstValue.buckets.under30s, color: 'bg-emerald-700' },
              { label: '30 – 60 segundos', count: summary.timeToFirstValue.buckets.from30to60s, color: 'bg-emerald-600' },
              { label: '1 – 2 minutos', count: summary.timeToFirstValue.buckets.from1to2m, color: 'bg-amber-600' },
              { label: '2 – 5 minutos', count: summary.timeToFirstValue.buckets.from2to5m, color: 'bg-orange-600' },
              { label: '> 5 minutos (Fricción alta)', count: summary.timeToFirstValue.buckets.over5m, color: 'bg-red-600' }
            ].map((bucket, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                  <span>{bucket.label}</span>
                  <span className="font-mono font-bold text-slate-900">{bucket.count} usuarios</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${bucket.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(5, bucket.count * 15))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIRST VALUE TYPE (PRIMER AHA MOMENT) */}
        <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-800" />
            <span>Primer Tipo de Valor Encontrado (First Value Type)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ¿Qué funcionalidad concreta generó el primer «Aha moment» en los participantes del piloto?
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(summary.timeToFirstValue.firstValueDistribution).map(([type, count]) => (
              <div key={type} className="p-2.5 bg-slate-50 rounded-xl border flex items-center justify-between">
                <span className="font-bold text-slate-700">{type.replace('_', ' ')}</span>
                <span className="font-mono font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEGUIMIENTO DE PLAN, DESPENSA, DECISIÓN Y RECETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Plan Followthrough */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Seguimiento de Plan Semanal
            </strong>
            <Badge variant="outline" className="font-mono text-emerald-800 font-bold text-xs">
              {summary.weeklyPlanMetrics.followthroughRate.percentage}%
            </Badge>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900">
            {summary.weeklyPlanMetrics.followthroughRate.formatted}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Planes creados que son posteriormente consultados, cocinados o llevados a lista.
          </p>
        </div>

        {/* Use Soon Followthrough */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rescate «Úsalo Pronto»
            </strong>
            <Badge variant="outline" className="font-mono text-amber-800 font-bold text-xs">
              {summary.pantryMetrics.useSoonFollowthroughRate.percentage}%
            </Badge>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900">
            {summary.pantryMetrics.useSoonFollowthroughRate.formatted}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Alimentos mostrados en «Úsalo pronto» que el usuario marca o registra como consumidos.
          </p>
        </div>

        {/* Decision Saved Feedback */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Decisiones Ahorradas
            </strong>
            <Badge variant="outline" className="font-mono text-indigo-800 font-bold text-xs">
              {summary.decisionSaved.savedRatio.percentage}%
            </Badge>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900">
            {summary.decisionSaved.savedRatio.formatted}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Usuarios que respondieron «Sí, me ayudó a decidir más rápido».
          </p>
          <div className="pt-2 flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => handleDecisionVote('yes')} className="h-6 px-1.5 text-[10px] text-emerald-700">
              + Voto Sí
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDecisionVote('somewhat')} className="h-6 px-1.5 text-[10px] text-slate-600">
              + Medio
            </Button>
          </div>
        </div>

        {/* Recipe Import Metrics */}
        <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Importador de Recetas
            </strong>
            <Badge variant="outline" className="font-mono text-cyan-800 font-bold text-xs">
              {summary.recipeImportMetrics.completionRate.percentage}%
            </Badge>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900">
            {summary.recipeImportMetrics.completionRate.formatted}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Completitud de importación web. Tiempo mediano: {summary.recipeImportMetrics.medianSeconds}s.
          </p>
        </div>
      </div>

      {/* SEAN ELLIS PMF SURVEY TEST (N=20) */}
      <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              <span>Test de Sean Ellis (D30): Product-Market Fit Signal</span>
            </h2>
            <p className="text-xs text-slate-500">
              «¿Cómo te sentirías si ya no pudieras utilizar Ecoland Daily?» (Aplicado en D30 a usuarios elegibles).
            </p>
          </div>
          <Badge
            variant={summary.pmfSurveyScore.pmfSignalAchieved ? 'default' : 'outline'}
            className={`font-mono text-xs font-bold ${summary.pmfSurveyScore.pmfSignalAchieved ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
          >
            {summary.pmfSurveyScore.pmfSignalAchieved ? '✓ PMF Validado (≥40% & N≥20)' : '⚠️ En curso / Muestra insuficiente'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold text-emerald-950">Muy decepcionado</strong>
              <span className="font-mono text-sm font-black text-emerald-900">{summary.pmfSurveyScore.veryDisappointed.formatted}</span>
            </div>
            <p className="text-[10px] text-emerald-800">
              Señal primaria de Product-Market Fit. Meta: ≥ 40% con N real.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold text-slate-900">Algo decepcionado</strong>
              <span className="font-mono text-sm font-black text-slate-900">{summary.pmfSurveyScore.somewhatDisappointed.formatted}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Ven valor ocasional pero tienen alternativas sustitutas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-xs font-bold text-slate-900">No me importaría</strong>
              <span className="font-mono text-sm font-black text-slate-900">{summary.pmfSurveyScore.notDisappointed.formatted}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              No experimentaron utilidad o el producto no resuelve su problema.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
          <span className="text-slate-500 font-bold">Simular / Registrar respuesta de participante:</span>
          <Button
            size="sm"
            variant={selectedPmfVote === 'very_disappointed' ? 'default' : 'outline'}
            onClick={() => handlePmfVote('very_disappointed')}
            className="rounded-xl h-7 text-xs"
          >
            Muy decepcionado
          </Button>
          <Button
            size="sm"
            variant={selectedPmfVote === 'somewhat_disappointed' ? 'default' : 'outline'}
            onClick={() => handlePmfVote('somewhat_disappointed')}
            className="rounded-xl h-7 text-xs"
          >
            Algo decepcionado
          </Button>
          <Button
            size="sm"
            variant={selectedPmfVote === 'not_disappointed' ? 'default' : 'outline'}
            onClick={() => handlePmfVote('not_disappointed')}
            className="rounded-xl h-7 text-xs"
          >
            No me importaría
          </Button>
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
            <div key={exp.id} className="p-4 rounded-2xl border space-y-3 bg-slate-50/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">{exp.name}</strong>
                  <p className="text-[11px] text-slate-500">{exp.hypothesis}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono font-bold">
                  Activa: {exp.activeVariant}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${exp.activeVariant === 'A' ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-[11px] font-bold">Variante A</strong>
                    <Button
                      size="sm"
                      variant={exp.activeVariant === 'A' ? 'default' : 'outline'}
                      onClick={() => handleToggleVariant(exp.id, 'A')}
                      className="h-5 px-1.5 text-[9px] rounded-lg"
                    >
                      Activar
                    </Button>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Muestra: {exp.variantMetrics.A.sampleCount} · Valor: {exp.variantMetrics.A.primaryValue}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${exp.activeVariant === 'B' ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-[11px] font-bold">Variante B</strong>
                    <Button
                      size="sm"
                      variant={exp.activeVariant === 'B' ? 'default' : 'outline'}
                      onClick={() => handleToggleVariant(exp.id, 'B')}
                      className="h-5 px-1.5 text-[9px] rounded-lg"
                    >
                      Activar
                    </Button>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Muestra: {exp.variantMetrics.B.sampleCount} · Valor: {exp.variantMetrics.B.primaryValue}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInsights;
