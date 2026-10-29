import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Cloud, Smartphone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { ALLERGEN_LABELS } from '@/data/catalog/productFacts';
import { getNeed } from '@/data/salud/needs';
import { isProfileEmpty, recommendProducts } from '@/lib/saludEngine';
import { ConsentDialog, SaludProductCard } from '@/components/salud/SaludParts';

/** Pestaña "Mi salud" de Mi cuenta: perfil guardado, recomendaciones y control de los datos */
export const MyHealthProfile = () => {
  const { profile, mode, consentGivenAt, saveToAccount, deleteFromAccount } = useHealthProfile();
  const { toast } = useToast();
  const [consentOpen, setConsentOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const recommendations = useMemo(
    () => (isProfileEmpty(profile) ? [] : recommendProducts(allCatalogProducts, profile, 8)),
    [profile],
  );

  if (isProfileEmpty(profile)) {
    return (
      <div className="bg-card rounded-2xl border p-6 text-center space-y-3">
        <HeartPulse className="w-8 h-8 mx-auto text-emerald-800" />
        <h2 className="font-display text-xl font-semibold">Tu perfil de alimentación</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Indica qué quieres cuidar (celiaquía, alergias, azúcar, sal…) y te mostraremos los productos que encajan contigo,
          con avisos en la cesta y recomendaciones aquí.
        </p>
        <Button asChild className="rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white">
          <Link to="/salud">Crear mi perfil en Ecoland Salud</Link>
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const res = await saveToAccount();
    setSaving(false);
    setConsentOpen(false);
    toast(res.ok ? { title: 'Perfil guardado en tu cuenta' } : { title: 'No se ha guardado', description: res.error, variant: 'destructive' });
  };

  const handleDelete = async () => {
    const res = await deleteFromAccount();
    toast(res.ok ? { title: 'Perfil borrado' } : { title: 'Error', description: res.error, variant: 'destructive' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Mi perfil de alimentación</h2>
            <p className="text-sm text-muted-foreground mt-1">Lo usamos para filtrar productos, revisar tu cesta y recomendarte alimentos.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/salud">Editar</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.needs.map(id => (
            <span key={id} className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-sm text-emerald-900">{getNeed(id)?.title}</span>
          ))}
          {profile.avoidAllergens.map(a => (
            <span key={a} className="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-sm text-red-800">Sin {ALLERGEN_LABELS[a].toLowerCase()}</span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {mode === 'cuenta' ? (
            <>
              <span className="flex items-center gap-2"><Cloud className="w-4 h-4 text-emerald-800" />
                Guardado en tu cuenta con tu consentimiento{consentGivenAt && ` (${new Date(consentGivenAt).toLocaleDateString('es-ES')})`}.
              </span>
              <Button variant="outline" size="sm" onClick={handleDelete} className="h-10 rounded-xl gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="w-4 h-4" /> Borrar mis datos
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-800" /> Solo está guardado en este dispositivo.</span>
              <Button size="sm" onClick={() => setConsentOpen(true)} className="h-10 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white">
                Guardar en mi cuenta
              </Button>
            </>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">Recomendados para ti</h3>
            <Link to="/salud" className="text-sm text-emerald-800 underline underline-offset-2">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recommendations.map(({ product, match }) => <SaludProductCard key={product.id} product={product} match={match} />)}
          </div>
        </div>
      )}

      <ConsentDialog open={consentOpen} onOpenChange={setConsentOpen} onAccept={handleSave} saving={saving} />
    </div>
  );
};
