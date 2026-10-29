import { describe, it, expect } from 'vitest';
import { forecastFor, typicalDurationDays, parseGrams, restockKey, type RestockEvent } from './restockForecastService';

const ev = (type: RestockEvent['type'], date: string, name = 'Matcha Iswari', format = '70 g'): RestockEvent =>
  ({ key: restockKey(name), name, type, date: new Date(date).toISOString(), format });

describe('restockForecastService', () => {
  it('lee formatos en gramos, kilos y litros', () => {
    expect(parseGrams('70 g')).toBe(70);
    expect(parseGrams('1kg')).toBe(1000);
    expect(parseGrams('1L')).toBe(1000);
    expect(parseGrams('Formato estándar')).toBeNull();
  });

  it('sin historial usa el consumo medio ajustado al formato', () => {
    expect(typicalDurationDays('Matcha Iswari', '40 g')).toBe(30);
    expect(typicalDurationDays('Matcha Iswari', '70 g')).toBe(53);
    const f = forecastFor([ev('compra', '2026-10-01')], new Date('2026-10-20'))!;
    expect(f.basis).toBe('consumo-medio');
    expect(f.durationDays).toBe(53);
  });

  it('con compras repetidas usa el intervalo real entre compras', () => {
    const f = forecastFor([ev('compra', '2026-08-01'), ev('compra', '2026-08-21'), ev('compra', '2026-09-10')], new Date('2026-09-25'))!;
    expect(f.basis).toBe('tus-compras');
    expect(f.durationDays).toBe(20);
    expect(f.daysLeft).toBe(5);
  });

  it('cuando el cliente marca "se acabó" aprende su consumo exacto', () => {
    const f = forecastFor([ev('compra', '2026-08-01'), ev('acabado', '2026-08-13'), ev('compra', '2026-09-01')], new Date('2026-09-11'))!;
    expect(f.basis).toBe('tu-consumo');
    expect(f.durationDays).toBe(12);
    expect(f.daysLeft).toBe(2);
  });

  it('no avisa de algo que ya se marcó como acabado tras la última compra', () => {
    expect(forecastFor([ev('compra', '2026-09-01'), ev('acabado', '2026-09-20')], new Date('2026-09-25'))).toBeNull();
  });

  it('"todavía me queda" aplaza el aviso', () => {
    const base = [ev('compra', '2026-09-01', 'Huevos camperos', '6 uds')];
    const before = forecastFor(base, new Date('2026-09-07'))!;
    const after = forecastFor([...base, ev('todavia', '2026-09-07', 'Huevos camperos', '6 uds')], new Date('2026-09-07'))!;
    expect(after.daysLeft).toBeGreaterThan(before.daysLeft);
  });
});
