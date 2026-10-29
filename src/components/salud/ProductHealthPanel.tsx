import { Link } from 'react-router-dom';
import type { CatalogProduct } from '@/data/catalog/individual-products';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { ALLERGEN_LABELS, getProductFacts } from '@/data/catalog/productFacts';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { evaluateProduct, isProfileEmpty } from '@/lib/saludEngine';
import { cleanProductName, formatPrice } from '@/lib/utils';
import { StatusBadge } from './SaludParts';

const SOURCE_LABEL = {
  declarado: 'declarado por el producto',
  inferido: 'deducido de qué es el producto',
  'naturalmente-sin-gluten': 'sin gluten por naturaleza, sin certificar',
  desconocido: 'sin verificar: consulta el envase',
} as const;

/** "Lo que sabemos de este producto": datos con su procedencia, encaje con el perfil y otros formatos */
export const ProductHealthPanel = ({ product }: { product: CatalogProduct }) => {
  const facts = getProductFacts(product.id);
  const { profile } = useHealthProfile();
  if (facts.kind === 'cosmetica' || facts.kind === 'hogar') return null;

  const match = isProfileEmpty(profile) ? null : evaluateProduct(product, profile);
  const formats = (facts.formatos ?? [])
    .map(id => allCatalogProducts.find(p => p.id === id))
    .filter((p): p is CatalogProduct => Boolean(p));

  const veganText = facts.vegano === true ? 'Sí' : facts.vegano === false ? 'No' : '—';
  const glutenText = facts.sinGluten === true ? 'Sin gluten' : facts.sinGluten === false ? 'Contiene gluten' : facts.glutenFuente === 'naturalmente-sin-gluten' ? 'Sin gluten por naturaleza' : '—';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4" aria-labelledby="lo-que-sabemos">
      <h3 id="lo-que-sabemos" className="font-sans text-sm font-semibold text-slate-900">Lo que sabemos de este producto</h3>

      {match && (
        <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
          <p className="text-xs font-medium text-slate-600">Con tu perfil de <Link to="/salud" className="underline">Ecoland Salud</Link>:</p>
          <StatusBadge status={match.status} />
          <ul className="text-sm text-slate-700">{match.reasons.slice(0, 3).map(r => <li key={r}>· {r}</li>)}</ul>
        </div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Vegano</dt>
          <dd className="font-medium text-slate-900">{veganText}</dd>
          <dd className="text-xs text-slate-500">{SOURCE_LABEL[facts.veganoFuente]}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Gluten</dt>
          <dd className="font-medium text-slate-900">{glutenText}</dd>
          <dd className="text-xs text-slate-500">{SOURCE_LABEL[facts.glutenFuente]}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Alérgenos que contiene</dt>
          <dd className="font-medium text-slate-900">
            {facts.alergenos.length ? facts.alergenos.map(a => ALLERGEN_LABELS[a]).join(', ') : 'Ninguno conocido'}
          </dd>
          <dd className="text-xs text-slate-500">las trazas solo aparecen en el envase</dd>
        </div>
      </dl>

      {formats.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Otros formatos</p>
          <div className="flex flex-wrap gap-2">
            {formats.map(f => (
              <Link
                key={f.id}
                to={`/tienda/producto/${f.slug}`}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-emerald-300"
              >
                {f.weight && f.weight !== 'Formato estándar' ? f.weight : cleanProductName(f.name, 24)} · {formatPrice(f.price)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
