import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Leaf, ShieldCheck, Check, Box, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem } from '@/context/CartContext';
import { PackSize } from '@/data/packs';
import { Link } from 'react-router-dom';
import { COMMERCIAL_RULES, calculateShippingCost } from '@/config/commercialRules';
import { cleanProductName, formatPrice } from '@/lib/utils';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { reviewCart, isProfileEmpty } from '@/lib/saludEngine';

// Las cuatro clases de artículo de la cesta se muestran con la misma fila
function toCartRow(item: CartItem) {
  switch (item.type) {
    case 'pack': {
      const discount = item.isSubscription ? COMMERCIAL_RULES.SUBSCRIPTION_DISCOUNT_FACTOR : 1;
      return {
        key: `pack-${item.pack.id}-${item.size}-${item.isSubscription}`,
        id: item.pack.id, size: item.size as PackSize | undefined,
        name: item.pack.name, image: item.pack.image,
        detail: `Tamaño ${item.size}${item.isSubscription ? ' · Suscripción -10%' : ''}`,
        unitPrice: item.pack.prices[item.size] * discount,
      };
    }
    case 'product':
      return {
        key: `product-${item.product.id}`, id: item.product.id, size: undefined,
        name: item.product.name, image: item.product.image, detail: item.product.category,
        unitPrice: item.product.price,
      };
    case 'catalog-product': {
      const weight = item.product.weight && item.product.weight !== 'Formato estándar' ? item.product.weight : '';
      return {
        key: `cat-prod-${item.product.id}`, id: item.product.id, size: undefined,
        name: cleanProductName(item.product.name),
        image: item.product.image,
        detail: [item.product.brand, weight].filter(Boolean).join(' · '),
        unitPrice: item.product.price,
      };
    }
    case 'catalog-pack':
      return {
        key: `cat-pack-${item.pack.id}`, id: item.pack.id, size: undefined,
        name: item.pack.name, image: item.pack.image, detail: 'Pack ahorro bio',
        unitPrice: item.pack.price,
      };
  }
}

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [zeroWastePackaging, setZeroWastePackaging] = useState(true);
  const { profile } = useHealthProfile();

  // Revisión con el perfil de Ecoland Salud: avisa, nunca bloquea la compra
  const profileConflicts = isProfileEmpty(profile)
    ? []
    : reviewCart(items.flatMap(i => (i.type === 'catalog-product' ? [i.product] : [])), profile);

  // Reglas comerciales centralizadas
  const shippingInfo = calculateShippingCost(totalPrice, 'domicilio');
  const freeThreshold = COMMERCIAL_RULES.FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min(100, Math.round((totalPrice / freeThreshold) * 100));

  // Evidencias ambientales verificadas (Prioridad 9: solo claims VERIFIED)
  const verifiedClaims = COMMERCIAL_RULES.ENVIRONMENTAL_EVIDENCE_SYSTEM.ACTIVE_VERIFIED_CLAIMS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-50 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display font-semibold text-lg text-foreground">Tu cesta</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Cerrar cesta"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progression Steps Indicator */}
            <div className="bg-slate-50 border-b px-4 py-2.5 flex items-center text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px]">1</span>
                Cesta
              </span>
              <span className="h-px flex-1 mx-2 bg-slate-200" aria-hidden />
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]">2</span>
                Entrega
              </span>
              <span className="h-px flex-1 mx-2 bg-slate-200" aria-hidden />
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]">3</span>
                Pago
              </span>
            </div>

            {/* Envío gratis progress bar (Regla comercial unificada a 49€) */}
            {items.length > 0 && (
              <div className="bg-emerald-50/70 px-4 py-2.5 border-b text-xs">
                {shippingInfo.isFree ? (
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <Check className="h-4 w-4 text-emerald-700" />
                    <span>¡Enhorabuena! Tienes <strong>Envío Gratuito</strong> a domicilio o tienda física.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Te faltan <strong className="text-emerald-950 font-semibold">{formatPrice(shippingInfo.remainingForFree)}</strong> para <strong>Envío Gratis</strong></span>
                      <span className="font-bold text-emerald-800">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-800 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {profileConflicts.length > 0 && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-950" role="status">
                <p className="font-semibold">
                  {profileConflicts.length === 1 ? 'Un producto no encaja' : `${profileConflicts.length} productos no encajan`} con tu perfil de Ecoland Salud:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {profileConflicts.map(({ product, match }) => (
                    <li key={product.id}>· {cleanProductName(product.name, 40)}: {match.reasons[0].toLowerCase()}</li>
                  ))}
                </ul>
                <Link to="/salud" onClick={() => setIsOpen(false)} className="mt-1 inline-block text-xs font-medium underline underline-offset-2">
                  Ver alternativas en Ecoland Salud
                </Link>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/60">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <p className="text-slate-700 font-bold text-sm">Tu cesta todavía está vacía</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explora nuestros packs de temporada, productos de herbolario o compone tu cesta con el Plato Harvard interactivo.
                  </p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    className="mt-2 text-xs font-bold rounded-xl"
                    asChild
                  >
                    <Link to="/tienda">Descubrir productos bio</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {items.map(item => {
                    const row = toCartRow(item);
                    return (
                      <li key={row.key} className="flex gap-3 p-3 rounded-2xl bg-white border border-slate-200/80">
                        <img
                          src={row.image}
                          alt=""
                          loading="lazy"
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-sans font-semibold text-sm leading-snug text-slate-900 line-clamp-2">{row.name}</h4>
                              {row.detail && <p className="text-xs text-slate-500 mt-0.5 truncate">{row.detail}</p>}
                            </div>
                            <button
                              onClick={() => removeItem(row.id, row.size, item.type)}
                              className="w-8 h-8 -mt-1 -mr-1 grid place-items-center rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                              aria-label={`Quitar ${row.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center rounded-full border border-slate-200">
                              <button
                                onClick={() => updateQuantity(row.id, item.quantity - 1, row.size, item.type)}
                                className="w-8 h-8 grid place-items-center text-slate-600 hover:text-emerald-900"
                                aria-label={`Una unidad menos de ${row.name}`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(row.id, item.quantity + 1, row.size, item.type)}
                                className="w-8 h-8 grid place-items-center text-slate-600 hover:text-emerald-900"
                                aria-label={`Una unidad más de ${row.name}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 tabular-nums">
                              {formatPrice(row.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t bg-card space-y-3">
                {/* Garantías ecológicas verificadas (solo claims con verification_status = VERIFIED) */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-900">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> Ecológico certificado UE
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-900">
                    <Box className="h-3.5 w-3.5 text-emerald-700" /> Embalaje FSC sin plástico
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-900">
                    <Leaf className="h-3.5 w-3.5 text-emerald-700" /> +{Math.floor(totalPrice)} EcoPuntos
                  </span>
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={zeroWastePackaging}
                    onChange={(e) => setZeroWastePackaging(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Empaque Zero Waste: caja reciclada y sin albarán en papel</span>
                </label>

                <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-sm text-slate-600 block">Subtotal (IVA incluido)</span>
                    <span className="text-xs text-slate-500">Envío 24/48 h o Click &amp; Collect</span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <Button
                  className="w-full h-12 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm gap-2"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link to="/checkout">
                    Tramitar pedido
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-slate-500">Pago seguro con tarjeta, Bizum o Apple Pay</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
