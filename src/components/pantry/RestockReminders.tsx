import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, BellOff, Check, ShoppingBasket, PackageX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { restockForecastService, REMIND_DAYS_BEFORE, type RestockForecast, type ForecastBasis } from '@/services/restockForecastService';

const BASIS_LABEL: Record<ForecastBasis, string> = {
  'tu-consumo': 'según tu consumo',
  'tus-compras': 'según tus compras',
  'consumo-medio': 'estimación con consumo medio',
};

const whenText = (days: number) =>
  days < 0 ? 'Probablemente ya se acabó' : days === 0 ? 'Se acaba hoy' : days === 1 ? 'Se acaba mañana' : `Quedan unos ${days} días`;

function useRestock() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  useEffect(() => {
    window.addEventListener('ecoland-reposicion', refresh);
    return () => window.removeEventListener('ecoland-reposicion', refresh);
  }, [refresh]);
  return {
    settings: restockForecastService.getSettings(),
    forecasts: restockForecastService.getForecasts(),
    due: restockForecastService.getDueReminders(),
    refresh,
  };
}

function ReminderRow({ f, onChange }: { f: RestockForecast; onChange: () => void }) {
  const act = (fn: () => void) => () => { fn(); onChange(); };
  return (
    <li className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
      <div>
        <p className="font-semibold text-slate-900">¿Te queda poco {f.name}?</p>
        <p className="text-xs text-slate-600">{whenText(f.daysLeft)} · {BASIS_LABEL[f.basis]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="h-9">
          <Link to={`/tienda?q=${encodeURIComponent(f.name)}`}><ShoppingBasket className="h-4 w-4 mr-1.5" />Pedir más</Link>
        </Button>
        <Button size="sm" variant="outline" className="h-9" onClick={act(() => restockForecastService.record('todavia', f.name))}>
          <Check className="h-4 w-4 mr-1.5" />Todavía me queda
        </Button>
        <Button size="sm" variant="outline" className="h-9" onClick={act(() => restockForecastService.record('acabado', f.name))}>
          <PackageX className="h-4 w-4 mr-1.5" />Ya se acabó
        </Button>
        <Button size="sm" variant="ghost" className="h-9 text-slate-500" onClick={act(() => restockForecastService.mute(f.key))}>
          <BellOff className="h-4 w-4 mr-1.5" />No avisar de esto
        </Button>
      </div>
    </li>
  );
}

/** Avisos pendientes (para Mi día). No muestra nada si no hay avisos o están desactivados. */
export function RestockDueBanner() {
  const { due, refresh } = useRestock();
  if (due.length === 0) return null;
  return (
    <section aria-label="Avisos de reposición" className="space-y-2">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-amber-600" />Revisa tu despensa
      </h2>
      <ul className="space-y-2">{due.slice(0, 3).map(f => <ReminderRow key={f.key} f={f} onChange={refresh} />)}</ul>
    </section>
  );
}

/** Panel completo: avisos, previsión de todo lo que sigues y ajustes. */
export function RestockPanel() {
  const { settings, forecasts, due, refresh } = useRestock();
  const upcoming = forecasts.filter(f => !due.some(d => d.key === f.key));
  return (
    <section id="reposicion" className="scroll-mt-24 rounded-3xl border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-700" />Avisos de reposición
          </h2>
          <p className="text-sm text-muted-foreground max-w-prose">
            Te avisamos {REMIND_DAYS_BEFORE} días antes de que se te acabe algo. Cuanto más uses la despensa
            (marca "se acabó" o "queda poco"), más exacto es el aviso.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch
            checked={settings.enabled}
            onCheckedChange={v => { restockForecastService.setEnabled(v); refresh(); }}
            aria-label="Activar avisos de reposición"
          />
          {settings.enabled ? 'Avisos activados' : 'Avisos desactivados'}
        </label>
      </div>

      {settings.enabled && due.length > 0 && (
        <ul className="space-y-2">{due.map(f => <ReminderRow key={f.key} f={f} onChange={refresh} />)}</ul>
      )}

      {forecasts.length === 0 ? (
        <div className="rounded-2xl bg-muted/50 p-4 text-sm text-slate-700">
          Todavía no sigues ningún producto. Añade lo que tienes en <Link to="/hoy?abrir=despensa" className="font-semibold text-emerald-800 underline">Mi despensa</Link> o
          importa tu próximo pedido, y aquí verás cuándo se te acabará cada cosa.
        </div>
      ) : upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Previsión</h3>
          <ul className="divide-y rounded-2xl border">
            {upcoming.map(f => (
              <li key={f.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="font-medium text-slate-800">{f.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-600 text-right">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {whenText(f.daysLeft)} · {BASIS_LABEL[f.basis]}
                  {settings.muted.includes(f.key) && (
                    <button className="ml-2 underline" onClick={() => { restockForecastService.unmute(f.key); refresh(); }}>reactivar aviso</button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Estos datos se guardan solo en este dispositivo.</p>
    </section>
  );
}
