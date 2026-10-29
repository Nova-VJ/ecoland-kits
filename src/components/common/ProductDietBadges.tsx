import { Leaf, WheatOff, MilkOff, Sparkles, Pill, Home } from 'lucide-react';
import { getProductFacts } from '@/data/catalog/productFacts';

interface Badge {
  label: string;
  icon: typeof Leaf;
  className: string;
}

// Etiquetas cortas para tarjetas: solo lo verificado (vegano y sin lactosa confirmados, sin gluten declarado).
export function getDietBadges(productId: string): Badge[] {
  const f = getProductFacts(productId);
  const badges: Badge[] = [];
  if (f.vegano === true) badges.push({ label: 'Vegano', icon: Leaf, className: 'bg-emerald-50 text-emerald-800 border-emerald-200' });
  if (f.sinGluten === true && f.glutenFuente === 'declarado') badges.push({ label: 'Sin gluten', icon: WheatOff, className: 'bg-amber-50 text-amber-900 border-amber-200' });
  if (f.sinLactosa === true && f.vegano !== true) badges.push({ label: 'Sin lactosa', icon: MilkOff, className: 'bg-sky-50 text-sky-900 border-sky-200' });
  if (f.kind === 'suplemento') badges.push({ label: 'Complemento', icon: Pill, className: 'bg-violet-50 text-violet-900 border-violet-200' });
  if (f.kind === 'cosmetica') badges.push({ label: 'Cosmética', icon: Sparkles, className: 'bg-pink-50 text-pink-900 border-pink-200' });
  if (f.kind === 'hogar') badges.push({ label: 'Hogar', icon: Home, className: 'bg-slate-50 text-slate-700 border-slate-200' });
  return badges;
}

export function ProductDietBadges({ productId, max = 3 }: { productId: string; max?: number }) {
  const badges = getDietBadges(productId).slice(0, max);
  if (badges.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Características del producto">
      {badges.map(({ label, icon: Icon, className }) => (
        <li key={label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>
          <Icon className="h-3 w-3" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
