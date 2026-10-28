import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Leaf, ShieldCheck, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, PackCartItem, ProductCartItem, CatalogProductCartItem, CatalogPackCartItem } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { COMMERCIAL_RULES, calculateShippingCost } from '@/config/commercialRules';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [zeroWastePackaging, setZeroWastePackaging] = useState(true);

  // Reglas comerciales centralizadas
  const shippingInfo = calculateShippingCost(totalPrice, 'domicilio');
  const freeThreshold = COMMERCIAL_RULES.FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min(100, Math.round((totalPrice / freeThreshold) * 100));

  // Estimación ambiental auditada según metodología documental (Prioridad 7)
  const estimatedCo2SavedKg = ((totalPrice * COMMERCIAL_RULES.ENVIRONMENTAL_CLAIMS.CO2_METHODOLOGY.factorGramsPerEuro) / 1000).toFixed(1);
  const estimatedPlasticSavedGrams = totalItems * COMMERCIAL_RULES.ENVIRONMENTAL_CLAIMS.PLASTIC_SAVED_METHODOLOGY.factorGramsPerItem;

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
                <h2 className="font-display font-semibold text-lg text-foreground">Tu Cesta Ecológica</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progression Steps Indicator */}
            <div className="bg-slate-50 border-b px-4 py-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[9px]">1</span>
                Cesta
              </span>
              <span className="text-slate-300">➔</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px]">2</span>
                Entrega / Recogida
              </span>
              <span className="text-slate-300">➔</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px]">3</span>
                Pago Seguro
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
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>Te faltan <strong className="text-emerald-950 font-mono font-bold">{shippingInfo.remainingForFree.toFixed(2)}€</strong> para <strong>Envío Gratis</strong></span>
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

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <p className="text-slate-700 font-bold text-sm">Tu cesta todavía está vacía</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
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
                items.map((item, index) => {
                  if (item.type === 'pack') {
                    const price = item.pack.prices[item.size];
                    const discount = item.isSubscription ? COMMERCIAL_RULES.SUBSCRIPTION_DISCOUNT_FACTOR : 1;
                    const finalItemPrice = price * discount;

                    return (
                      <div
                        key={`pack-${item.pack.id}-${item.size}-${item.isSubscription}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={item.pack.image}
                            alt={item.pack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">{item.pack.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            Tamaño: <span className="font-semibold">{item.size}</span>
                            {item.isSubscription && (
                              <span className="ml-1 text-emerald-800 font-bold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
                                -10% Suscripción
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                            {(finalItemPrice * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.pack.id, item.quantity - 1, item.size, 'pack')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.pack.id, item.quantity + 1, item.size, 'pack')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.pack.id, item.size, 'pack')}
                            className="p-1 text-slate-400 hover:text-red-500 ml-1"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'product') {
                    return (
                      <div
                        key={`product-${item.product.id}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">{item.product.name}</h4>
                          <p className="text-[11px] text-slate-500">{item.product.category}</p>
                          <p className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                            {(item.product.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, undefined, 'product')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, undefined, 'product')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, undefined, 'product')}
                            className="p-1 text-slate-400 hover:text-red-500 ml-1"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'catalog-product') {
                    return (
                      <div
                        key={`cat-prod-${item.product.id}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">{item.product.name}</h4>
                          <p className="text-[11px] text-slate-500">{item.product.brand || item.product.unit}</p>
                          <p className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                            {(item.product.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, undefined, 'catalog-product')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, undefined, 'catalog-product')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, undefined, 'catalog-product')}
                            className="p-1 text-slate-400 hover:text-red-500 ml-1"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'catalog-pack') {
                    return (
                      <div
                        key={`cat-pack-${item.pack.id}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={item.pack.image}
                            alt={item.pack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">{item.pack.name}</h4>
                          <p className="text-[11px] text-slate-500">Pack Ahorro Bio</p>
                          <p className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                            {(item.pack.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.pack.id, item.quantity - 1, undefined, 'catalog-pack')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.pack.id, item.quantity + 1, undefined, 'catalog-pack')}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.pack.id, undefined, 'catalog-pack')}
                            className="p-1 text-slate-400 hover:text-red-500 ml-1"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t bg-card space-y-3">
                {/* Environmental Impact Box (Prioridad 7: Claim auditado y metodología declarada) */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-emerald-700" />
                      Impacto Estimado de tu Cesta
                    </span>
                    <span className="text-emerald-800 font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      +{Math.floor(totalPrice)} EcoPuntos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                      <span className="text-slate-500 block text-[10px]">CO₂ evitado (est.)*</span>
                      <strong className="text-emerald-950 font-mono">~{estimatedCo2SavedKg} kg CO₂e</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                      <span className="text-slate-500 block text-[10px]">Plástico evitado*</span>
                      <strong className="text-emerald-950 font-mono">~{estimatedPlasticSavedGrams}g virgen</strong>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 leading-tight">
                    *Estimación orientativa (LCA FiBL/IFOAM 160g CO₂e/€ y 15g plástico/artículo). No constituye certificación individual de compensación.
                  </p>

                  {/* Opción Packaging 100% Sin Plástico */}
                  <label className="flex items-center gap-2 pt-1.5 cursor-pointer text-[11px] text-slate-700 border-t border-emerald-100">
                    <input 
                      type="checkbox" 
                      checked={zeroWastePackaging} 
                      onChange={(e) => setZeroWastePackaging(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>Empaque Zero Waste: cartón reciclado FSC y sin factura en papel (Gratis)</span>
                  </label>
                </div>

                {/* Subtotal y Botón de Checkout */}
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-slate-400 text-xs block">Subtotal con IVA</span>
                    <span className="text-[11px] text-emerald-800 font-semibold">Envío 24/48h o Click & Collect</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>

                <Button 
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-black text-sm py-6 rounded-2xl shadow-md gap-2"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link to="/checkout">
                    <span>Tramitar pedido seguro ➔</span>
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-2.5 text-[10px] text-slate-400 font-medium pt-1">
                  <span>🔒 SSL 256-bit</span>
                  <span>•</span>
                  <span>⚡ Bizum</span>
                  <span>•</span>
                  <span>💳 Tarjeta</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
