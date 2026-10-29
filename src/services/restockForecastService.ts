/**
 * Previsión de reposición: calcula cuándo se acabará cada producto de la despensa y avisa unos días antes.
 *
 * Cómo aprende (de más a menos fiable):
 *  1. "tu consumo": días reales entre una compra y el momento en que el cliente marcó "se acabó".
 *  2. "tus compras": días medios entre compras sucesivas del mismo producto.
 *  3. "consumo medio": duración típica según el tipo de producto y su formato (estimación orientativa).
 * Todo se guarda solo en este dispositivo y los avisos se pueden desactivar en general o por producto.
 */

export type ForecastBasis = 'tu-consumo' | 'tus-compras' | 'consumo-medio';

export interface RestockEvent {
  key: string;
  name: string;
  type: 'compra' | 'acabado' | 'todavia';
  date: string; // ISO
  productId?: string;
  format?: string;
}

export interface RestockForecast {
  key: string;
  name: string;
  productId?: string;
  lastPurchase: string;
  expectedEmpty: string;
  daysLeft: number;
  durationDays: number;
  basis: ForecastBasis;
}

const EVENTS_KEY = 'ecoland-reposicion-eventos';
const SETTINGS_KEY = 'ecoland-reposicion-ajustes';
const DAY = 86_400_000;
export const REMIND_DAYS_BEFORE = 3;

interface Settings { enabled: boolean; muted: string[] }

export const restockKey = (name: string) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Duración típica (días) de un envase "normal" por tipo de producto, para un hogar de 1–2 personas.
// Se ajusta por formato: el doble de cantidad dura aproximadamente el doble.
const TYPICAL: Array<{ match: RegExp; days: number; grams?: number }> = [
  { match: /\bhuevo/, days: 7 },
  { match: /\b(leche|bebida (vegetal|de avena|de soja|de almendra|de arroz)|kefir|yogur)/, days: 5, grams: 1000 },
  { match: /\b(pan|tortitas)\b/, days: 4 },
  { match: /\b(fruta|manzana|platano|naranja|fresa|frambuesa|verdura|lechuga|tomate|calabacin|coliflor)/, days: 6 },
  { match: /\bmatcha\b/, days: 30, grams: 40 },
  { match: /\b(cafe|te |te$|infusion|rooibos)/, days: 25, grams: 250 },
  { match: /\b(aceite|aove)\b/, days: 30, grams: 1000 },
  { match: /\b(copos|avena|muesli|granola|cereales|corn flakes)/, days: 14, grams: 500 },
  { match: /\b(arroz|pasta|quinoa|cuscus|cous cous|harina|lenteja|garbanzo|alubia|judia)/, days: 21, grams: 500 },
  { match: /\b(miel|sirope|azucar|mermelada|crema de)/, days: 30, grams: 400 },
  { match: /\b(tamari|shoyu|salsa|vinagre|sal\b|especia|curcuma|pimienta)/, days: 45, grams: 250 },
  { match: /\b(spirulina|chlorella|proteina|colageno|complemento|capsulas|comprimidos)/, days: 30 },
  { match: /\b(champu|gel|jabon|crema|desodorante|dentifrico|detergente|lavavajillas)/, days: 40 },
];
const DEFAULT_DAYS = 30;

export function parseGrams(format?: string): number | null {
  if (!format) return null;
  const m = format.toLowerCase().replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(kg|k|g|gr|l|litros?|ml|cl)\b/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2];
  if (unit === 'kg' || unit === 'k' || unit.startsWith('l')) return n * 1000;
  if (unit === 'cl') return n * 10;
  return n;
}

export function typicalDurationDays(name: string, format?: string): number {
  const text = ` ${restockKey(name)} `;
  const rule = TYPICAL.find(r => r.match.test(text));
  if (!rule) return DEFAULT_DAYS;
  const grams = parseGrams(format) ?? parseGrams(name);
  if (rule.grams && grams) return Math.max(3, Math.round(rule.days * (grams / rule.grams)));
  return rule.days;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Calcula la previsión de un producto a partir de su historial (eventos ordenados o no). */
export function forecastFor(events: RestockEvent[], now = new Date()): RestockForecast | null {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const purchases = sorted.filter(e => e.type === 'compra');
  if (purchases.length === 0) return null;
  const last = purchases[purchases.length - 1];
  // Si ya se marcó "se acabó" después de la última compra, no hay nada que prever.
  if (sorted.some(e => e.type === 'acabado' && e.date >= last.date)) return null;

  // 1. Ciclos reales compra → acabado
  const cycles: number[] = [];
  for (const p of purchases) {
    const end = sorted.find(e => e.type === 'acabado' && e.date > p.date);
    const nextPurchase = purchases.find(q => q.date > p.date);
    if (end && (!nextPurchase || end.date <= nextPurchase.date)) {
      cycles.push((Date.parse(end.date) - Date.parse(p.date)) / DAY);
    }
  }
  let duration: number;
  let basis: ForecastBasis;
  if (cycles.length > 0) {
    duration = median(cycles); basis = 'tu-consumo';
  } else if (purchases.length >= 2) {
    const gaps = purchases.slice(1).map((p, i) => (Date.parse(p.date) - Date.parse(purchases[i].date)) / DAY);
    duration = median(gaps); basis = 'tus-compras';
  } else {
    duration = typicalDurationDays(last.name, last.format); basis = 'consumo-medio';
  }
  duration = Math.max(1, Math.round(duration));

  // "Todavía me queda" después de la última compra: aplaza la previsión desde ese momento.
  const stillHave = sorted.filter(e => e.type === 'todavia' && e.date >= last.date).pop();
  const startMs = Date.parse(last.date);
  let emptyMs = startMs + duration * DAY;
  if (stillHave) emptyMs = Math.max(emptyMs, Date.parse(stillHave.date) + Math.max(3, Math.round(duration / 3)) * DAY);

  const daysLeft = Math.ceil((emptyMs - now.getTime()) / DAY);
  return {
    key: last.key, name: last.name, productId: last.productId, lastPurchase: last.date,
    expectedEmpty: new Date(emptyMs).toISOString(), daysLeft, durationDays: duration, basis,
  };
}

class RestockForecastService {
  private read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento no disponible */ }
  }

  getEvents(): RestockEvent[] { return this.read<RestockEvent[]>(EVENTS_KEY, []); }

  getSettings(): Settings { return { enabled: true, muted: [], ...this.read<Partial<Settings>>(SETTINGS_KEY, {}) }; }

  setEnabled(enabled: boolean) { this.write(SETTINGS_KEY, { ...this.getSettings(), enabled }); }

  mute(key: string) {
    const s = this.getSettings();
    if (!s.muted.includes(key)) this.write(SETTINGS_KEY, { ...s, muted: [...s.muted, key] });
  }

  unmute(key: string) {
    const s = this.getSettings();
    this.write(SETTINGS_KEY, { ...s, muted: s.muted.filter(k => k !== key) });
  }

  record(type: RestockEvent['type'], name: string, extra: { productId?: string; format?: string; date?: Date } = {}) {
    const event: RestockEvent = {
      key: restockKey(name), name, type, date: (extra.date ?? new Date()).toISOString(),
      productId: extra.productId, format: extra.format,
    };
    const events = [...this.getEvents(), event].slice(-500);
    this.write(EVENTS_KEY, events);
    window.dispatchEvent(new Event('ecoland-reposicion'));
  }

  getForecasts(now = new Date()): RestockForecast[] {
    const byKey = new Map<string, RestockEvent[]>();
    for (const e of this.getEvents()) byKey.set(e.key, [...(byKey.get(e.key) ?? []), e]);
    return [...byKey.values()]
      .map(evs => forecastFor(evs, now))
      .filter((f): f is RestockForecast => f !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }

  /** Productos que conviene revisar ya (avisos activos, no silenciados). */
  getDueReminders(now = new Date()): RestockForecast[] {
    const s = this.getSettings();
    if (!s.enabled) return [];
    return this.getForecasts(now).filter(f => f.daysLeft <= REMIND_DAYS_BEFORE && !s.muted.includes(f.key));
  }
}

export const restockForecastService = new RestockForecastService();
