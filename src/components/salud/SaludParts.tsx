import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, WheatOff, MilkOff, Sprout, Salad, Activity, HeartPulse, Heart, Wheat, Scale, Stethoscope,
  CircleCheck, TriangleAlert, CircleX, CircleHelp, ShoppingBag, Lock, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CatalogProduct } from '@/data/catalog/individual-products';
import type { MatchResult, MatchStatus } from '@/lib/saludEngine';
import { cleanProductName, formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export const NEED_ICONS: Record<string, LucideIcon> = {
  alergias: ShieldAlert, celiaquia: WheatOff, lactosa: MilkOff, vegano: Sprout, vegetariano: Salad,
  azucar: Activity, sal: HeartPulse, corazon: Heart, fibra: Wheat, peso: Scale, renal: Stethoscope, digestivo: Stethoscope,
};

export const STATUS_META: Record<MatchStatus, { label: string; icon: LucideIcon; className: string }> = {
  compatible: { label: 'Compatible según la información disponible', icon: CircleCheck, className: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  revisar: { label: 'Revisar', icon: TriangleAlert, className: 'bg-amber-50 text-amber-900 border-amber-200' },
  conflicto: { label: 'No encaja con tu perfil', icon: CircleX, className: 'bg-red-50 text-red-800 border-red-200' },
  'sin-datos': { label: 'Información insuficiente', icon: CircleHelp, className: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const StatusBadge = ({ status, short = false }: { status: MatchStatus; short?: boolean }) => {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.className}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {short && status === 'compatible' ? 'Compatible' : meta.label}
    </span>
  );
};

export const SaludProductCard = ({ product, match }: { product: CatalogProduct; match: MatchResult }) => {
  const { addCatalogProduct } = useCart();
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <Link to={`/tienda/producto/${product.slug}`} className="block aspect-square bg-slate-50">
        <img src={product.image} alt={cleanProductName(product.name)} loading="lazy" className="w-full h-full object-contain p-3" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <StatusBadge status={match.status} short />
        <Link to={`/tienda/producto/${product.slug}`} className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-900">
          {cleanProductName(product.name)}
        </Link>
        <p className="text-xs text-slate-500">{product.brand}</p>
        <ul className="space-y-0.5 text-xs text-slate-600">
          {match.reasons.slice(0, 2).map(r => <li key={r}>· {r}</li>)}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-semibold text-slate-900 tabular-nums">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            onClick={() => addCatalogProduct(product)}
            disabled={!product.inStock}
            className="h-10 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white gap-1.5"
            aria-label={`Añadir ${cleanProductName(product.name)} a la cesta`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{product.inStock ? 'Añadir' : 'Agotado'}</span>
          </Button>
        </div>
      </div>
    </article>
  );
};

/** Consentimiento explícito para guardar el perfil en la cuenta (RGPD art. 9) */
export const ConsentDialog = ({
  open, onOpenChange, onAccept, saving,
}: { open: boolean; onOpenChange: (open: boolean) => void; onAccept: () => void; saving: boolean }) => {
  const [accepted, setAccepted] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setAccepted(false); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-emerald-800" /> Guardar mi perfil en mi cuenta</DialogTitle>
          <DialogDescription>
            Lo que eliges en Ecoland Salud (por ejemplo, celiaquía o controlar el azúcar) puede revelar datos de tu salud.
            Por eso solo lo guardamos si tú lo autorizas.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>· <strong>Para qué:</strong> únicamente para filtrar productos, avisarte en la cesta y recomendarte alimentos.</li>
          <li>· <strong>Qué no hacemos:</strong> no lo usamos para publicidad ni lo compartimos con terceros.</li>
          <li>· <strong>Tú decides:</strong> puedes cambiarlo o borrarlo cuando quieras desde Ecoland Salud o desde Mi cuenta.</li>
          <li>· <strong>Sin cuenta también funciona:</strong> si no aceptas, tu perfil sigue guardado solo en este dispositivo.</li>
        </ul>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 cursor-pointer">
          <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" />
          <span>
            Doy mi consentimiento explícito para que Ecoland guarde estas necesidades alimentarias en mi cuenta con la finalidad descrita.
            Más información en la <Link to="/privacidad" className="underline">política de privacidad</Link>.
          </span>
        </label>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Ahora no</Button>
          <Button onClick={onAccept} disabled={!accepted || saving} className="rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white">
            {saving ? 'Guardando…' : 'Aceptar y guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
