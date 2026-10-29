import { useEffect, useState } from 'react';
import { Check, Leaf, Tags } from 'lucide-react';

// Ficha larga de venta, redactada a partir de la investigación verificada de cada producto.
// Se sirve como JSON aparte (public/fichas/<id>.json) para no cargar 1.000 fichas en la tienda.
export interface ProductFichaData {
  id: string;
  titulo: string;
  intro: string;
  secciones: { titulo: string; texto: string }[];
  versatilidad: { intro: string; usos: string[]; cierre: string };
  compromiso: string;
  categorias: string[];
  alergenos_texto: string;
  cierre: string;
}

export function useProductFicha(productId: string | undefined) {
  const [ficha, setFicha] = useState<ProductFichaData | null>(null);
  useEffect(() => {
    setFicha(null);
    if (!productId) return;
    let cancelled = false;
    fetch(`/fichas/${encodeURIComponent(productId)}.json`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('json') ? res.json() : null))
      .then(data => { if (!cancelled && data?.intro) setFicha(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [productId]);
  return ficha;
}

const splitUse = (use: string) => {
  const i = use.indexOf(':');
  return i > 0 && i < 60 ? [use.slice(0, i), use.slice(i + 1).trim()] : [null, use];
};

export function ProductFichaBody({ ficha }: { ficha: ProductFichaData }) {
  return (
    <div className="space-y-6 pt-6 border-t border-slate-200 text-slate-700">
      <p className="text-base leading-relaxed">{ficha.intro}</p>

      {ficha.secciones.map(s => (
        <section key={s.titulo}>
          <h2 className="font-display text-lg font-bold text-emerald-950 mb-1.5">{s.titulo}</h2>
          <p className="text-base leading-relaxed">{s.texto}</p>
        </section>
      ))}

      <section className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-lg font-bold text-emerald-950">Versatilidad en la cocina</h2>
        {ficha.versatilidad.intro && <p className="text-sm leading-relaxed">{ficha.versatilidad.intro}</p>}
        <ul className="space-y-2">
          {ficha.versatilidad.usos.map(use => {
            const [head, rest] = splitUse(use);
            return (
              <li key={use} className="flex gap-2 text-sm leading-relaxed">
                <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{head && <strong className="font-semibold text-emerald-950">{head}: </strong>}{rest}</span>
              </li>
            );
          })}
        </ul>
        {ficha.versatilidad.cierre && <p className="text-sm leading-relaxed">{ficha.versatilidad.cierre}</p>}
      </section>

      {ficha.compromiso && (
        <section>
          <h2 className="font-display text-lg font-bold text-emerald-950 mb-1.5 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            Compromiso ecológico
          </h2>
          <p className="text-base leading-relaxed">{ficha.compromiso}</p>
        </section>
      )}

      {ficha.categorias.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tags className="h-4 w-4 text-slate-500" aria-label="Categorías" />
          {ficha.categorias.map(c => (
            <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductFichaClosing({ ficha }: { ficha: ProductFichaData }) {
  if (!ficha.cierre) return null;
  return (
    <p className="rounded-2xl bg-emerald-950 text-emerald-50 p-5 text-base leading-relaxed font-medium">
      {ficha.cierre}
    </p>
  );
}
