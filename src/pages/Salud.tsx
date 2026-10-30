import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Smartphone, Cloud, Trash2, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { ALLERGEN_LABELS } from '@/data/catalog/productFacts';
import { EU_ALLERGENS, HEALTH_NEEDS, NEED_GROUPS, getNeed } from '@/data/salud/needs';
import { recommendProducts, isProfileEmpty } from '@/lib/saludEngine';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { ConsentDialog, NEED_ICONS, SaludProductCard, STATUS_META, StatusBadge } from '@/components/salud/SaludParts';

const PAGE_SIZE = 12;

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const Salud = () => {
  const { profile, mode, consentGivenAt, isLoggedIn, toggleNeed, toggleAllergen, clearProfile, saveToAccount, deleteFromAccount } = useHealthProfile();
  const { toast } = useToast();
  const [consentOpen, setConsentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const selectedNeeds = profile.needs.map(getNeed).filter(Boolean) as NonNullable<ReturnType<typeof getNeed>>[];
  const onlyClinical = selectedNeeds.length > 0 && selectedNeeds.every(n => n.level === 'D') && profile.avoidAllergens.length === 0;
  const allergiesOpen = profile.needs.includes('alergias') || profile.avoidAllergens.length > 0;

  const results = useMemo(() => {
    if (isProfileEmpty(profile) || onlyClinical) return [];
    const q = normalize(search.trim());
    const pool = q.length >= 2 ? allCatalogProducts.filter(p => normalize(p.name + ' ' + p.brand).includes(q)) : allCatalogProducts;
    return recommendProducts(pool, profile, 400);
  }, [profile, search, onlyClinical]);

  const handleSave = async () => {
    setSaving(true);
    const res = await saveToAccount();
    setSaving(false);
    setConsentOpen(false);
    toast(res.ok
      ? { title: 'Perfil guardado en tu cuenta', description: 'Puedes borrarlo cuando quieras.' }
      : { title: 'No se ha guardado', description: res.error, variant: 'destructive' });
  };

  const handleDelete = async () => {
    const res = await deleteFromAccount();
    toast(res.ok ? { title: 'Perfil borrado', description: 'Hemos eliminado tus datos de Ecoland Salud.' } : { title: 'Error', description: res.error, variant: 'destructive' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <div className="container-eco py-8 md:py-12 space-y-8">

        {/* Cabecera */}
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Ecoland Salud</p>
          <h1 className="font-display text-3xl md:text-4xl text-slate-900 mt-1">Entiende lo que comes. Elige lo que necesitas.</h1>
          <p className="text-slate-600 mt-3">
            Queremos que una persona con celiaquía pueda comprar sin revisar cincuenta etiquetas, y que quien cuida su azúcar o su sal entienda de un vistazo lo que lleva a casa.
            Te ayudamos a filtrar, comparar y aprender. No diagnosticamos ni sustituimos a tu médico o dietista-nutricionista.
          </p>
        </header>

                {/* Acceso Rápido al Plato de Harvard y Calculadora TDEE */}
        <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200">
              Herramienta de Nutrición
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold">Plato Saludable de Harvard y Calculadora</h2>
            <p className="text-emerald-100 text-sm max-w-xl">
              Diseña tus comidas equilibradas (50% vegetales, 25% granos integrales, 25% proteína saludable) y calcula tu gasto calórico diario.
            </p>
          </div>
          <Link to="/ecohealth" className="inline-flex items-center gap-2 bg-white text-emerald-950 font-bold px-5 py-2.5 rounded-2xl hover:bg-emerald-50 transition-colors shrink-0">
            Abrir Plato de Harvard
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Paso 1: qué quieres cuidar */}
        <section aria-labelledby="paso-1" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="paso-1" className="text-2xl text-slate-900">¿Qué quieres cuidar?</h2>
            {!isProfileEmpty(profile) && (
              <button type="button" onClick={clearProfile} className="text-sm text-slate-500 hover:text-red-600 underline underline-offset-2">
                Quitar todo
              </button>
            )}
          </div>

          {NEED_GROUPS.map(group => {
            const needs = HEALTH_NEEDS.filter(n => n.group === group.id);
            return (
              <div key={group.id}>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="font-sans text-sm font-semibold text-slate-900">{group.title}</h3>
                  <span className="text-xs text-slate-500">{group.description}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {needs.map(need => {
                    const Icon = NEED_ICONS[need.id];
                    const active = profile.needs.includes(need.id);
                    return (
                      <button
                        key={need.id}
                        type="button"
                        onClick={() => toggleNeed(need.id)}
                        aria-pressed={active}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                          active ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${active ? 'bg-white/15' : 'bg-emerald-50 text-emerald-800'}`}>
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{need.title}</span>
                            {active && <Check className="w-4 h-4 shrink-0" />}
                          </span>
                          <span className={`block text-xs mt-0.5 ${active ? 'text-emerald-100' : 'text-slate-500'}`}>{need.forWho}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {allergiesOpen && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">¿Qué alérgenos necesitas evitar?</p>
              <p className="text-xs text-slate-500 mb-3">Los 14 de declaración obligatoria en la Unión Europea.</p>
              <div className="flex flex-wrap gap-2">
                {EU_ALLERGENS.map(a => {
                  const active = profile.avoidAllergens.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergen(a)}
                      aria-pressed={active}
                      className={`h-10 px-3.5 rounded-xl border text-sm font-medium transition-colors ${
                        active ? 'bg-red-700 border-red-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-red-300'
                      }`}
                    >
                      {ALLERGEN_LABELS[a]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Privacidad: dónde se guarda el perfil */}
        {!isProfileEmpty(profile) && (
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            {mode === 'cuenta' ? (
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <Cloud className="w-5 h-5 text-emerald-800 shrink-0" />
                <span>
                  Guardado en tu cuenta{consentGivenAt && <> desde el {new Date(consentGivenAt).toLocaleDateString('es-ES')}</>}, con tu consentimiento.
                  Lo verás en cualquier dispositivo y en <Link to="/cuenta" className="underline">Mi cuenta</Link>.
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <Smartphone className="w-5 h-5 text-emerald-800 shrink-0" />
                <span>Tu perfil se guarda solo en este dispositivo. Ecoland no recibe ningún dato.</span>
              </p>
            )}
            {mode === 'cuenta' ? (
              <Button variant="outline" onClick={handleDelete} className="rounded-xl gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0">
                <Trash2 className="w-4 h-4" /> Borrar de mi cuenta
              </Button>
            ) : isLoggedIn ? (
              <Button onClick={() => setConsentOpen(true)} className="rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white shrink-0">
                Guardar en mi cuenta
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-xl border-emerald-200 text-emerald-900 shrink-0">
                <Link to="/registro">Crear cuenta para guardarlo y recibir recomendaciones</Link>
              </Button>
            )}
          </section>
        )}

        {/* Paso 2: qué hay que saber de cada necesidad */}
        {selectedNeeds.length > 0 && (
          <section aria-labelledby="paso-2" className="space-y-3">
            <h2 id="paso-2" className="text-2xl text-slate-900">Lo que conviene saber</h2>
            <div className="grid lg:grid-cols-2 gap-3">
              {selectedNeeds.map(need => (
                <details key={need.id} className="group rounded-2xl border border-slate-200 bg-white" open={selectedNeeds.length === 1}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold text-slate-900">{need.title}</span>
                    <span className="text-xs text-emerald-800 group-open:hidden">Ver</span>
                    <span className="text-xs text-emerald-800 hidden group-open:inline">Cerrar</span>
                  </summary>
                  <div className="space-y-3 px-4 pb-4 text-sm text-slate-700">
                    <p><strong className="text-slate-900">Cómo te ayudamos:</strong> {need.howWeHelp}</p>
                    <p><strong className="text-slate-900">Lo que no podemos simplificar:</strong> {need.limits}</p>
                    <div>
                      <strong className="text-slate-900">En la etiqueta:</strong>
                      <ul className="mt-1 space-y-1">{need.labelTips.map(t => <li key={t}>· {t}</li>)}</ul>
                    </div>
                    <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-950">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" /> <span><strong>Cuándo consultar:</strong> {need.whenToConsult}</span>
                    </p>
                    <p className="text-xs text-slate-500">Fuentes: {need.sources.join(' · ')}. Revisado en octubre de 2026.</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Paso 3: productos */}
        {!isProfileEmpty(profile) && (
          <section aria-labelledby="paso-3" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <h2 id="paso-3" className="text-2xl text-slate-900">Productos que encajan contigo</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Primero los compatibles según la información disponible, después los que conviene revisar. Los que no encajan no se muestran.
                </p>
              </div>
              <div className="relative md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
                  placeholder="Buscar dentro de tus resultados"
                  aria-label="Buscar dentro de tus resultados"
                  className="h-11 pl-9 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {(['compatible', 'revisar', 'conflicto', 'sin-datos'] as const).map(s => <StatusBadge key={s} status={s} />)}
            </div>

            {onlyClinical ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
                En estos casos no recomendamos productos automáticamente: lo que te conviene depende de tu diagnóstico, tus análisis y tu tratamiento.
                Busca en la <Link to="/tienda" className="underline">tienda</Link> los productos que te haya indicado tu profesional sanitario.
              </p>
            ) : results.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
                No hemos encontrado productos con información suficiente para tu combinación. Prueba a quitar algún filtro o pregúntanos en tienda.
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  {results.filter(r => r.match.status === 'compatible').length} compatibles · {results.filter(r => r.match.status === 'revisar').length} para revisar
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {results.slice(0, visible).map(({ product, match }) => (
                    <SaludProductCard key={product.id} product={product} match={match} />
                  ))}
                </div>
                {visible < results.length && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="lg" onClick={() => setVisible(v => v + PAGE_SIZE)} className="rounded-xl">
                      Ver más ({results.length - visible})
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <p className="text-xs text-slate-500 max-w-3xl">
          {STATUS_META.compatible.label}: según lo que sabemos del producto, que no es la etiqueta completa. Comprueba siempre el envase,
          sobre todo si tienes alergias. Ecoland Salud es información para ayudarte a comprar, no un consejo médico.
        </p>
      </div>

      <ConsentDialog open={consentOpen} onOpenChange={setConsentOpen} onAccept={handleSave} saving={saving} />
    </div>
  );
};

export default Salud;
