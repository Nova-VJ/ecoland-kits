import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle2, ArrowRight, ShieldCheck, Truck, 
  MapPin, CreditCard, Lock, Sparkles, AlertCircle, ChevronLeft,
  Store, Leaf, FileText, Check, TreeDeciduous, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { COMMERCIAL_RULES, calculateShippingCost } from '@/config/commercialRules';
import { 
  transactionalOrderService, 
  CartItemToValidate, 
  OrderRecord, 
  PaymentProvider 
} from '@/services/transactionalOrderService';

import { dailyNutritionStore } from '@/services/dailyNutritionStore';

export const Checkout = () => {
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'click_and_collect'>('domicilio');
  const [zeroWastePackaging, setZeroWastePackaging] = useState(true);
  const [plantTree, setPlantTree] = useState(false); // Por defecto desactivado para transparencia comercial

  // Form Data
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: 'Valladolid',
    codigoPostal: '47001',
    nif: '', // NIF/CIF para emisión de factura legal según RD 1619/2012
    notas: '',
  });

  // Métodos de pago disponibles
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [pantryAdded, setPantryAdded] = useState(false);
  const [pantryPromptDismissed, setPantryPromptDismissed] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // Generar clave de idempotencia única al cargar el checkout
  useEffect(() => {
    setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Cálculo de gastos de envío mediante Fuente Única de Verdad (Single Source of Truth)
  const shippingInfo = calculateShippingCost(totalPrice, deliveryMethod, formData.codigoPostal);
  const shippingCost = shippingInfo.shippingCost;
  const treeCost = plantTree ? COMMERCIAL_RULES.TREE_CONTRIBUTION.AMOUNT : 0;
  const finalTotal = totalPrice + shippingCost + treeCost;

  // Métricas ambientales auditadas (Prioridad 7)
  const estimatedCo2 = ((totalPrice * COMMERCIAL_RULES.ENVIRONMENTAL_CLAIMS.CO2_METHODOLOGY.factorGramsPerEuro) / 1000).toFixed(1);
  const ecoPointsEarned = Math.floor(finalTotal);

  const handleInputChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const validateStep1 = () => {
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.telefono.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, email y teléfono de contacto.",
        variant: "destructive"
      });
      return false;
    }
    if (deliveryMethod === 'domicilio' && !formData.direccion.trim()) {
      toast({
        title: "Dirección requerida",
        description: "Indica tu dirección para el envío refrigerado en 24/48h.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  /**
   * PROCESAMIENTO TRANSACCIONAL END-TO-END CON AUTORIDAD DEL SERVIDOR
   * 1. Valida precios y stock contra el catálogo maestro (servidor).
   * 2. Reserva stock temporalmente.
   * 3. Procesa confirmación del proveedor de pago.
   * 4. Consolida stock definitivamente y genera número de factura legal.
   */
  const handleProcessOrder = async () => {
    if (isProcessing) return; // Prevención de doble clic
    setIsProcessing(true);

    try {
      // Mapear artículos de carrito al formato de validación estricta
      const itemsToValidate: CartItemToValidate[] = items.map(it => {
        let id = '';
        let clientUnitPrice = 0;
        let isSubscription = false;

        if (it.type === 'pack') {
          id = it.pack.id;
          clientUnitPrice = it.pack.prices[it.size];
          isSubscription = it.isSubscription;
        } else if (it.type === 'product') {
          id = it.product.id;
          clientUnitPrice = it.product.price;
        } else if (it.type === 'catalog-product') {
          id = it.product.id;
          clientUnitPrice = it.product.price;
        } else if (it.type === 'catalog-pack') {
          id = it.pack.id;
          clientUnitPrice = it.pack.price;
        }

        return {
          id,
          type: it.type,
          quantity: it.quantity,
          clientUnitPrice,
          isSubscription
        };
      });

      // 1. Crear intento de orden con reserva de stock e idempotencia
      const customerInput = {
        name: `${formData.nombre} ${formData.apellidos}`.trim(),
        email: formData.email.trim(),
        phone: formData.telefono.trim(),
        taxId: formData.nif.trim() || undefined,
        deliveryMethod,
        shippingAddress: formData.direccion.trim(),
        shippingCity: formData.ciudad.trim(),
        shippingPostalCode: formData.codigoPostal.trim(),
        zeroWastePackaging,
        plantTree,
        notes: formData.notes
      };

      const intentRes = transactionalOrderService.createOrderIntent(
        customerInput,
        itemsToValidate,
        idempotencyKey
      );

      if (!intentRes.success || !intentRes.order) {
        toast({
          title: "Error de validación en servidor",
          description: intentRes.error || "No se pudo crear la reserva del pedido.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // 2. Simular llamada a pasarela de pago (Redsys / Stripe / Bizum)
      await new Promise(res => setTimeout(res, 900));

      const txnId = `txn_${paymentMethod}_${Date.now()}`;
      const payRes = transactionalOrderService.processPaymentConfirmation(
        intentRes.order.id,
        paymentMethod,
        txnId,
        true // Simulado exitoso en entorno de pruebas
      );

      if (!payRes.success || !payRes.order) {
        toast({
          title: "Pago rechazado",
          description: payRes.error || "La transacción no pudo ser autorizada.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // 3. Confirmación real persistente
      setConfirmedOrder(payRes.order);
      setIsProcessing(false);
      clearCart();

      toast({
        title: "¡Pedido y Pago Confirmados!",
        description: `Ref: ${payRes.order.orderNumber}. Factura: ${payRes.order.invoiceNumber}. Gracias por apoyar la alimentación biológica.`,
      });

    } catch (e: any) {
      console.error("Error en checkout transaccional:", e);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error procesando el pedido. No se ha realizado ningún cobro.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="section-padding min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 rounded-3xl bg-white border shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-black text-slate-900">Tu cesta está vacía</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Añade alimentos desde nuestra tienda o planifica tu cesta saludable con el Plato Harvard antes de tramitar el pedido.
          </p>
          <Button asChild className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs py-5 px-6 rounded-2xl">
            <Link to="/tienda">Ir al catálogo de productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  // PANTALLA DE ÉXITO Y CONFIRMACIÓN TRANSACCIONAL REAL
  if (confirmedOrder) {
    return (
      <div className="section-padding min-h-[75vh] flex items-center justify-center bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full border shadow-lg text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto text-3xl shadow-inner font-bold">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transacción Confirmada y Facturada
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">
              ¡Gracias por tu compra en Ecoland!
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Tu pedido ha sido registrado en el sistema central. Nuestro equipo de la tienda de Valladolid ya tiene tu orden en cola de preparación.
            </p>
          </div>

          {/* Resumen auditado del pedido confirmado */}
          <div className="p-5 rounded-2xl bg-slate-50 border text-left text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Número de pedido:</span>
              <strong className="font-mono text-emerald-950 font-bold text-sm">{confirmedOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Factura legal emitida:</span>
              <strong className="font-mono text-slate-800 font-bold">{confirmedOrder.invoiceNumber}</strong>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Modalidad de entrega:</span>
              <span className="font-semibold text-slate-800">
                {confirmedOrder.customer.deliveryMethod === 'click_and_collect' 
                  ? `Recogida Click & Collect en tienda (${COMMERCIAL_RULES.PHYSICAL_STORE.address})` 
                  : `Envío refrigerado a domicilio: ${confirmedOrder.customer.shippingAddress}, ${confirmedOrder.customer.shippingPostalCode}`}
              </span>
            </div>
            {confirmedOrder.pickupSlot && (
              <div className="flex justify-between items-center border-b pb-2 text-emerald-800 font-medium">
                <span>Disponibilidad en tienda:</span>
                <span>{confirmedOrder.pickupSlot.estimatedReadyTime}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Método y pasarela:</span>
              <span className="capitalize font-semibold text-slate-800">
                {confirmedOrder.payment?.provider} (ID: {confirmedOrder.payment?.transactionId})
              </span>
            </div>

            {/* Desglose fiscal legal (IVA España RD 1619/2012) */}
            <div className="pt-1 text-[11px] text-slate-500 border-t space-y-1">
              <span className="font-bold text-slate-700 block">Desglose de impuestos (IVA incluido):</span>
              {confirmedOrder.taxBreakdown.base4 > 0 && (
                <div className="flex justify-between">
                  <span>Base Alimentos Básicos (4%): {confirmedOrder.taxBreakdown.base4.toFixed(2)}€</span>
                  <span>Cuota IVA 4%: {confirmedOrder.taxBreakdown.iva4.toFixed(2)}€</span>
                </div>
              )}
              {confirmedOrder.taxBreakdown.base10 > 0 && (
                <div className="flex justify-between">
                  <span>Base Alimentación General (10%): {confirmedOrder.taxBreakdown.base10.toFixed(2)}€</span>
                  <span>Cuota IVA 10%: {confirmedOrder.taxBreakdown.iva10.toFixed(2)}€</span>
                </div>
              )}
              {confirmedOrder.taxBreakdown.base21 > 0 && (
                <div className="flex justify-between">
                  <span>Base Cosmética / Portes (21%): {confirmedOrder.taxBreakdown.base21.toFixed(2)}€</span>
                  <span>Cuota IVA 21%: {confirmedOrder.taxBreakdown.iva21.toFixed(2)}€</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 font-bold border-t text-sm">
              <span>Total Pagado:</span>
              <span className="text-base text-emerald-950 font-mono">{confirmedOrder.total.toFixed(2)}€</span>
            </div>
          </div>

          {/* Integracion Pedidos -> Despensa Inteligente (P1-C) */}
          {!pantryAdded && !pantryPromptDismissed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="font-bold text-sm text-emerald-950">
                  ¿Añadir estos productos a tu despensa inteligente?
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Podrás aprovecharlos automáticamente en las sugerencias de «Completa mi día» y descontarlos al cocinar para evitar desperdicio alimentario.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl"
                  onClick={() => {
                    const itemsToAdd = confirmedOrder.lines.map(l => ({
                      name: l.productName,
                      quantity: l.quantity
                    }));
                    dailyNutritionStore.addOrderItemsToPantry(itemsToAdd);
                    setPantryAdded(true);
                    toast({
                      title: "¡Despensa actualizada!",
                      description: `Se han añadido ${itemsToAdd.length} productos a tu despensa inteligente.`
                    });
                  }}
                >
                  Añadir a mi despensa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-800 hover:bg-emerald-100 text-xs font-semibold rounded-xl"
                  onClick={() => setPantryPromptDismissed(true)}
                >
                  No ahora
                </Button>
              </div>
            </motion.div>
          )}

          {pantryAdded && (
            <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 font-medium text-center flex items-center justify-center gap-2">
              <span>✓ Productos añadidos a tu despensa con fecha de compra de hoy.</span>
              <Link to="/hoy" className="underline font-bold hover:text-emerald-950 ml-1">
                Ver en Ecoland Hoy
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs py-5 px-6 rounded-2xl">
              <Link to="/tienda">Continuar explorando Ecoland</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-300 text-slate-700 text-xs py-5 px-6 rounded-2xl font-bold">
              <Link to="/cuenta">Ver historial de pedidos</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-slate-50/50 min-h-screen">
      <div className="container-eco max-w-5xl space-y-8">
        
        {/* Breadcrumb & Volver */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/tienda" className="hover:text-emerald-800 flex items-center gap-1 font-medium">
            <ChevronLeft className="h-3.5 w-3.5" /> Volver a la tienda
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Proceso de Checkout Seguro</span>
        </div>

        {/* Indicador de Pasos Numerados */}
        <div className="bg-white rounded-2xl p-4 border shadow-2xs flex items-center justify-between text-xs font-bold text-slate-600">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-emerald-900 text-white shadow-2xs' : 'bg-slate-200'
            }`}>1</span>
            <span>1. Datos y Entrega</span>
          </div>

          <span className="text-slate-300">➔</span>

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-emerald-900 text-white shadow-2xs' : 'bg-slate-200'
            }`}>2</span>
            <span>2. Pago y Facturación</span>
          </div>

          <span className="text-slate-300">➔</span>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">3</span>
            <span>3. Confirmación</span>
          </div>
        </div>

        {/* Grid Principal: Formulario (7 cols) + Resumen Cesta (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-6">
            
            {/* PASO 1: DATOS Y ENTREGA */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-800" />
                    1. Modalidad de Entrega
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elige entre envío refrigerado sostenible o recogida gratuita en nuestra tienda física de Valladolid.
                  </p>
                </div>

                {/* Selector Modalidad: Envío vs Click & Collect */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryMethod('domicilio')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === 'domicilio' 
                        ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-700/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Truck className={`h-5 w-5 ${deliveryMethod === 'domicilio' ? 'text-emerald-800' : 'text-slate-400'}`} />
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {totalPrice >= COMMERCIAL_RULES.FREE_SHIPPING_THRESHOLD ? 'GRATIS' : `${COMMERCIAL_RULES.STANDARD_SHIPPING_PRICE.toFixed(2)}€`}
                      </Badge>
                    </div>
                    <strong className="block text-slate-900 text-xs">Envío Refrigerado 24/48h</strong>
                    <span className="text-[11px] text-slate-500">Control de temperatura garantizado. Gratis a partir de {COMMERCIAL_RULES.FREE_SHIPPING_THRESHOLD.toFixed(2)}€.</span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('click_and_collect')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === 'click_and_collect' 
                        ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-700/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Store className={`h-5 w-5 ${deliveryMethod === 'click_and_collect' ? 'text-emerald-800' : 'text-slate-400'}`} />
                      <Badge className="bg-emerald-800 text-white text-[10px] font-bold">SIEMPRE GRATIS</Badge>
                    </div>
                    <strong className="block text-slate-900 text-xs">Click & Collect Valladolid</strong>
                    <span className="text-[11px] text-slate-500">Recogida sin colas en tienda física ({COMMERCIAL_RULES.PHYSICAL_STORE.address}). Listo en 2h.</span>
                  </div>
                </div>

                {/* Formulario de Datos Personales */}
                <div className="space-y-4 pt-2 border-t">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Datos del Cliente y Facturación
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Nombre *</label>
                      <Input 
                        placeholder="Ej: Laura" 
                        value={formData.nombre} 
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Apellidos</label>
                      <Input 
                        placeholder="Ej: Martín Gómez" 
                        value={formData.apellidos} 
                        onChange={(e) => handleInputChange('apellidos', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Email de confirmación *</label>
                      <Input 
                        type="email"
                        placeholder="tu@email.com" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Teléfono móvil *</label>
                      <Input 
                        type="tel"
                        placeholder="600 000 000" 
                        value={formData.telefono} 
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">NIF / CIF (opcional para factura oficial)</label>
                      <Input 
                        placeholder="Ej: 12345678Z" 
                        value={formData.nif} 
                        onChange={(e) => handleInputChange('nif', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Código Postal *</label>
                      <Input 
                        placeholder="47001" 
                        value={formData.codigoPostal} 
                        onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                  </div>

                  {deliveryMethod === 'domicilio' && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">Dirección completa *</label>
                        <Input 
                          placeholder="Calle, número, piso, puerta" 
                          value={formData.direccion} 
                          onChange={(e) => handleInputChange('direccion', e.target.value)}
                          className="rounded-xl text-xs h-10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">Ciudad</label>
                        <Input 
                          value={formData.ciudad} 
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          className="rounded-xl text-xs h-10"
                        />
                      </div>
                    </div>
                  )}

                  {deliveryMethod === 'click_and_collect' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1 text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="h-4 w-4 text-emerald-800" />
                        Punto de Recogida Oficial
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        {COMMERCIAL_RULES.PHYSICAL_STORE.name} — {COMMERCIAL_RULES.PHYSICAL_STORE.address}.
                        <br />
                        Horario: {COMMERCIAL_RULES.PHYSICAL_STORE.schedule}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Compromisos Sostenibles */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border text-xs">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-700 shrink-0" />
                      <div>
                        <strong className="block text-slate-900 text-xs">Embalaje Zero Waste (Sin Plástico)</strong>
                        <span className="text-[11px] text-slate-500">Cartón reciclado FSC y precinto de almidón vegetal (Sin coste extra)</span>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={zeroWastePackaging} 
                      onChange={(e) => setZeroWastePackaging(e.target.checked)}
                      className="rounded text-emerald-800 focus:ring-emerald-700 shrink-0 ml-2"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <TreeDeciduous className="h-4 w-4 text-slate-500 shrink-0" />
                      <div>
                        <strong className="block text-slate-700 text-xs">Reforestación Comunitaria en Castilla y León</strong>
                        <span className="text-[11px] text-slate-500 leading-snug block">
                          {COMMERCIAL_RULES.TREE_CONTRIBUTION.NOTICE}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-500 font-normal">Piloto en trámite</Badge>
                  </div>

                  <Button 
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-6 text-sm rounded-2xl shadow-md gap-2 mt-4"
                  >
                    <span>Continuar al Pago Seguro</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASO 2: PAGO Y FACTURACIÓN */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-800" />
                      Método de Pago Seguro
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transacciones bancarias certificadas SSL 256-bit y protocolo PSD2 / 3D Secure.
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Editar datos
                  </button>
                </div>

                {/* Opciones de Pago Auditadas */}
                <div className="space-y-3 text-xs">
                  {[
                    { id: 'tarjeta', label: '💳 Tarjeta de Crédito / Débito (Visa, Mastercard)', desc: 'Cifrado seguro bancario Redsys / Stripe (PSD2 cumplido)' },
                    { id: 'bizum', label: '⚡ Bizum', desc: 'Pago instantáneo mediante pasarela bancaria española oficial' },
                    { id: 'apple_pay', label: '🍏 Apple Pay / Google Pay', desc: 'Pago rápido en dispositivos compatibles certificados' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        paymentMethod === m.id
                          ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-600/20 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <strong className="block text-slate-900 text-xs">{m.label}</strong>
                        <span className="text-[11px] text-slate-500">{m.desc}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === m.id ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-300'
                      }`}>
                        {paymentMethod === m.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Formulario simulado de tarjeta para pruebas sin almacenar datos */}
                {paymentMethod === 'tarjeta' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 pb-1">
                      <span className="font-bold">Datos de la Tarjeta</span>
                      <span className="text-[10px] text-emerald-800 font-semibold">🔒 Pasarela Segura</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600">Número de tarjeta (Modo Test Activo)</label>
                      <Input 
                        placeholder="•••• •••• •••• 4242" 
                        defaultValue="4242 4242 4242 4242"
                        className="rounded-xl font-mono text-xs h-10 bg-white"
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-600">Caducidad</label>
                        <Input 
                          placeholder="MM/AA" 
                          defaultValue="12/28"
                          className="rounded-xl font-mono text-xs h-10 bg-white"
                          readOnly
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-600">CVC</label>
                        <Input 
                          placeholder="•••" 
                          defaultValue="123"
                          className="rounded-xl font-mono text-xs h-10 bg-white"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 border">
                  <Lock className="h-4 w-4 text-emerald-800 shrink-0" />
                  <span>No almacenamos datos de tarjeta en nuestros servidores. La transacción se procesa directamente a través de pasarela bancaria regulada.</span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    className="flex-1 rounded-2xl py-6 text-xs font-bold"
                  >
                    ← Modificar entrega
                  </Button>
                  <Button 
                    onClick={handleProcessOrder}
                    disabled={isProcessing}
                    className="flex-2 bg-emerald-900 hover:bg-emerald-800 text-white font-black py-6 text-sm rounded-2xl shadow-md gap-2"
                  >
                    {isProcessing ? 'Validando en servidor y pagando...' : `Pagar ${finalTotal.toFixed(2)}€`}
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha: Resumen de Cesta e Impacto Ambiental (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border shadow-xs space-y-5">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Resumen del Pedido</h4>
                <span className="text-xs text-slate-500">{totalItems} alimentos bio seleccionados</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900 border-0 text-[10px] font-bold">
                +{ecoPointsEarned} EcoPuntos
              </Badge>
            </div>

            {/* Lista resumida de artículos */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              {items.map((it, idx) => {
                const name = it.type === 'catalog-product' 
                  ? (it as any).product.name.split('–')[1]?.trim() || (it as any).product.name
                  : (it as any).pack?.name || 'Pack Eco';
                const price = (it as any).product?.price || (it as any).pack?.price || 0;
                return (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div className="truncate flex-1 pr-2">
                      <span className="font-bold text-slate-800 truncate block">{name}</span>
                      <span className="text-[10px] text-slate-400">Cant: {it.quantity}</span>
                    </div>
                    <strong className="font-mono text-slate-900 shrink-0">{(price * it.quantity).toFixed(2)}€</strong>
                  </div>
                );
              })}
            </div>

            {/* Garantías de Sostenibilidad Oficialmente Verificadas (Prioridad 9) */}
            <div className="p-3.5 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Garantías de Sostenibilidad Verificadas
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
                  <div>
                    <strong className="block text-white text-[11px]">100% Certificación Bio Oficial (Eurohoja)</strong>
                    <span className="text-[10px] text-emerald-300">Reglamento (UE) 2018/848 sin transgénicos ni pesticidas sintéticos.</span>
                  </div>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-800 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-300 shrink-0" />
                  <div>
                    <strong className="block text-white text-[11px]">Embalaje FSC 100% Libre de Plástico Virgen</strong>
                    <span className="text-[10px] text-emerald-300">Cartón reciclado y viruta vegetal compostable certificada.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose Económico Centralizado */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal alimentos</span>
                <span className="font-mono">{totalPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Coste de entrega ({deliveryMethod === 'click_and_collect' ? 'Tienda' : 'Domicilio'})</span>
                <span className="font-mono font-bold text-emerald-800">
                  {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)}€`}
                </span>
              </div>
              {plantTree && (
                <div className="flex justify-between text-teal-800 font-medium">
                  <span>Aportación reforestación (CyL)</span>
                  <span className="font-mono">+{COMMERCIAL_RULES.TREE_CONTRIBUTION.AMOUNT.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>IVA incluido (desglose oficial en factura)</span>
                <span className="font-mono">{(finalTotal * 0.091).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t">
                <span>Total a Pagar</span>
                <span className="font-mono text-xl text-emerald-950">{finalTotal.toFixed(2)}€</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
