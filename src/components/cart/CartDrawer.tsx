import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Leaf, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, PackCartItem, ProductCartItem, CatalogProductCartItem, CatalogPackCartItem } from '@/context/CartContext';
import { Link } from 'react-router-dom';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [showBasketAnalysis, setShowBasketAnalysis] = useState(false);
  const [zeroWastePackaging, setZeroWastePackaging] = useState(true);

  // Estimación de impacto ambiental positivo frente a compra convencional
  const estimatedCo2Saved = (totalPrice * 0.16).toFixed(1);
  const estimatedPlasticSaved = totalItems * 45;

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
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-800" />
                <h2 className="font-display font-bold text-xl text-slate-900">Tu Cesta Ecoland</h2>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Indicador de Progreso del Pedido (Página 4 del Informe) */}
            <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="text-emerald-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[9px]">1</span>
                Cesta (Activa)
              </span>
              <span className="text-slate-300">➔</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px]">2</span>
                Envío / Recogida
              </span>
              <span className="text-slate-300">➔</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px]">3</span>
                Pago Seguro
              </span>
            </div>

            {/* Envío gratis progress bar */}
            {items.length > 0 && (
              <div className="bg-emerald-50/70 px-4 py-2.5 border-b text-xs">
                {totalPrice >= 45 ? (
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <Check className="h-4 w-4 text-emerald-700" />
                    <span>¡Enhorabuena! Tienes <strong>Envío Gratuito</strong> a domicilio o tienda física.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>Te faltan <strong className="text-emerald-950 font-mono font-bold">{(45 - totalPrice).toFixed(2)}€</strong> para <strong>Envío Gratis</strong></span>
                      <span className="font-bold text-emerald-800">{Math.min(100, Math.round((totalPrice / 45) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-800 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (totalPrice / 45) * 100)}%` }} 
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
                    Explora nuestra tienda o usa el Plato Harvard para llenar tu despensa de alimentos ecológicos.
                  </p>
                  <Button 
                    className="mt-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link to="/tienda">Explorar catálogo bio</Link>
                  </Button>
                </div>
              ) : (
                items.map((item) => {
                  if (item.type === 'catalog-product') {
                    const cItem = item as CatalogProductCartItem;
                    return (
                      <div key={`catalog-prod-${cItem.product.id}`} className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border p-1 shrink-0 flex items-center justify-center">
                          <img src={cItem.product.image} alt={cItem.product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 truncate">
                              {cItem.product.name.split('–')[1]?.trim() || cItem.product.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 block font-mono">{cItem.product.brand}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 bg-white border rounded-lg px-1">
                              <button 
                                className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 text-xs font-bold" 
                                onClick={() => updateQuantity(cItem.product.id, cItem.quantity - 1, undefined, 'catalog-product')}
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-xs font-bold">{cItem.quantity}</span>
                              <button 
                                className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 text-xs font-bold" 
                                onClick={() => updateQuantity(cItem.product.id, cItem.quantity + 1, undefined, 'catalog-product')}
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm text-slate-900">
                                {(cItem.product.price * cItem.quantity).toFixed(2)}€
                              </span>
                              <button 
                                className="text-slate-300 hover:text-rose-600 transition-colors p-1" 
                                onClick={() => removeItem(cItem.product.id, undefined, 'catalog-product')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (item.type === 'pack') {
                    const pItem = item as PackCartItem;
                    return (
                      <div key={`pack-${pItem.pack.id}-${pItem.plan}`} className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border p-1 shrink-0 flex items-center justify-center">
                          <img src={pItem.pack.image} alt={pItem.pack.title} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 truncate">{pItem.pack.title}</h3>
                            <span className="text-[10px] text-slate-400 block capitalize">{pItem.plan}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Cant: {pItem.quantity}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm text-slate-900">
                                {(pItem.pack.plans[pItem.plan].price * pItem.quantity).toFixed(2)}€
                              </span>
                              <button 
                                className="text-slate-300 hover:text-rose-600 transition-colors p-1" 
                                onClick={() => removeItem(pItem.pack.id, pItem.plan, 'pack')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (item.type === 'catalog-pack') {
                    const ckItem = item as CatalogPackCartItem;
                    return (
                      <div key={`catalog-pack-${ckItem.pack.id}`} className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-emerald-50 border p-1 shrink-0 flex items-center justify-center text-2xl">
                          {ckItem.pack.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 truncate">{ckItem.pack.name}</h3>
                            <span className="text-[10px] text-slate-400 block">Cesta temática</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Cant: {ckItem.quantity}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm text-slate-900">
                                {(ckItem.pack.price * ckItem.quantity).toFixed(2)}€
                              </span>
                              <button 
                                className="text-slate-300 hover:text-rose-600 transition-colors p-1" 
                                onClick={() => removeItem(ckItem.pack.id, undefined, 'catalog-pack')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>

            {/* Footer con Calculadora de Impacto y Checkout */}
            {items.length > 0 && (
              <div className="p-4 border-t space-y-3 bg-slate-50/60">
                
                {/* Calculadora de Impacto Ambiental & Sostenibilidad (Allbirds / Form Nutrition) */}
                <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <Leaf className="h-4 w-4 text-emerald-700" />
                      Impacto Positivo de tu Pedido
                    </span>
                    <span className="text-emerald-800 font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full">
                      +{Math.floor(totalPrice)} EcoPuntos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-slate-500 block text-[10px]">CO₂ evitado est.</span>
                      <strong className="text-emerald-950 font-mono">~{estimatedCo2Saved} kg CO₂e</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-slate-500 block text-[10px]">Plástico evitado</span>
                      <strong className="text-emerald-950 font-mono">~{estimatedPlasticSaved}g virgen</strong>
                    </div>
                  </div>

                  {/* Opción Packaging 100% Sin Plástico */}
                  <label className="flex items-center gap-2 pt-1.5 cursor-pointer text-[11px] text-slate-700 border-t border-slate-100">
                    <input 
                      type="checkbox" 
                      checked={zeroWastePackaging} 
                      onChange={(e) => setZeroWastePackaging(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>Empaque Zero Waste: cartón reciclado FSC y sin factura en papel</span>
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
                  <span>🍏 Apple Pay</span>
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
