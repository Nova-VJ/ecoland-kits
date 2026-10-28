import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle2, ArrowRight, ShieldCheck, Truck, 
  MapPin, CreditCard, Lock, Sparkles, AlertCircle, ChevronLeft,
  Store, Leaf, FileText, Check, TreeDeciduous
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const Checkout = () => {
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'click_and_collect'>('domicilio');
  const [zeroWastePackaging, setZeroWastePackaging] = useState(true);
  const [plantTree, setPlantTree] = useState(true);

  // Form Data
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: 'Valladolid',
    codigoPostal: '47001',
    nif: '',
    notas: '',
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'bizum' | 'apple_pay'>('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const shippingCost = deliveryMethod === 'click_and_collect' ? 0 : totalPrice >= 45 ? 0 : 4.90;
  const treeCost = plantTree ? 0.80 : 0;
  const finalTotal = totalPrice + shippingCost + treeCost;
  const estimatedCo2 = (totalPrice * 0.16 + (plantTree ? 22 : 0)).toFixed(1);
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

  const handleProcessOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const orderId = `ECO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderConfirmed(orderId);
      setIsProcessing(false);
      clearCart();
      toast({
        title: "¡Pedido confirmado con éxito!",
        description: `Referencia: ${orderId}. Gracias por elegir alimentación biológica y sostenible.`,
      });
    }, 1200);
  };

  if (items.length === 0 && !orderConfirmed) {
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

  // PANTALLA DE ÉXITO Y CONFIRMACIÓN
  if (orderConfirmed) {
    return (
      <div className="section-padding min-h-[75vh] flex items-center justify-center bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full border shadow-lg text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto text-3xl shadow-inner">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pago y Reserva Confirmada
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">
              ¡Gracias por tu compra en Ecoland!
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Hemos recibido tu pedido y nuestro equipo lo está preparando con empaque ecológico certificado.
            </p>
          </div>

          {/* Resumen del pedido confirmado */}
          <div className="p-5 rounded-2xl bg-slate-50 border text-left text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Número de referencia:</span>
              <strong className="font-mono text-emerald-950 font-bold text-sm">{orderConfirmed}</strong>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Modalidad de entrega:</span>
              <span className="font-semibold text-slate-800">
                {deliveryMethod === 'click_and_collect' ? 'Recogida gratuita en tienda física (Valladolid)' : 'Envío refrigerado a domicilio en 24/48h'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Impacto ecológico:</span>
              <strong className="text-emerald-700 font-bold">
                ~{estimatedCo2} kg CO₂ evitado {plantTree && '· 🌳 +1 Árbol financiado'} · +{ecoPointsEarned} EcoPuntos
              </strong>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span>Importe total pagado:</span>
              <span className="text-base text-slate-900 font-mono">{finalTotal.toFixed(2)}€</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs py-5 px-6 rounded-2xl">
              <Link to="/tienda">Continuar explorando Ecoland</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-300 text-slate-700 text-xs py-5 px-6 rounded-2xl font-bold">
              <Link to="/cuenta">Ver en mis pedidos</Link>
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

        {/* Layout en 2 Columnas: Formulario + Resumen lateral */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de Checkout (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-6">
            
            {/* PASO 1: MODALIDAD DE ENTREGA Y DATOS PERSONALES */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-800" />
                    ¿Cómo prefieres recibir tu pedido?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elige entre envío refrigerado a tu domicilio o recogida gratuita en nuestra tienda física de Valladolid.
                  </p>
                </div>

                {/* Selector Omnicanal */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('domicilio')}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                      deliveryMethod === 'domicilio'
                        ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-600/20 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-emerald-800" />
                        Envío a Domicilio
                      </span>
                      <strong className="text-emerald-800 font-mono">
                        {totalPrice >= 45 ? 'GRATIS' : '4.90€'}
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Entrega en 24/48h en España peninsular en caja térmica isotérmica.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('click_and_collect')}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                      deliveryMethod === 'click_and_collect'
                        ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-600/20 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-emerald-800" />
                        Click & Collect
                      </span>
                      <strong className="text-emerald-800 font-mono">GRATIS</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Recogida en tienda física de Valladolid. Listo en 2 horas sin esperas.
                    </p>
                  </button>
                </div>

                {/* Formulario de Contacto y Dirección */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Datos del Comprador
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nombre *</label>
                      <Input 
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        placeholder="Ej. Laura"
                        className="rounded-xl bg-slate-50 h-10 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Apellidos</label>
                      <Input 
                        value={formData.apellidos}
                        onChange={(e) => handleInputChange('apellidos', e.target.value)}
                        placeholder="Ej. García López"
                        className="rounded-xl bg-slate-50 h-10 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Email (para confirmación) *</label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="laura@ejemplo.com"
                        className="rounded-xl bg-slate-50 h-10 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Teléfono móvil *</label>
                      <Input 
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        placeholder="600 000 000"
                        className="rounded-xl bg-slate-50 h-10 text-xs"
                      />
                    </div>
                  </div>

                  {deliveryMethod === 'domicilio' && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Dirección de Envío
                      </h4>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 text-xs">Calle, número y piso *</label>
                        <Input 
                          value={formData.direccion}
                          onChange={(e) => handleInputChange('direccion', e.target.value)}
                          placeholder="Calle Mayor 12, 3º B"
                          className="rounded-xl bg-slate-50 h-10 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Ciudad</label>
                          <Input 
                            value={formData.ciudad}
                            onChange={(e) => handleInputChange('ciudad', e.target.value)}
                            className="rounded-xl bg-slate-50 h-10 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Código Postal</label>
                          <Input 
                            value={formData.codigoPostal}
                            onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                            className="rounded-xl bg-slate-50 h-10 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Packaging Zero Waste */}
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span className="text-slate-700 text-[11px]">
                        <strong>Empaque Zero Waste:</strong> cartón 100% reciclado FSC sin plásticos y factura digital (ahorra papel).
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={zeroWastePackaging} 
                      onChange={(e) => setZeroWastePackaging(e.target.checked)}
                      className="rounded text-emerald-800 focus:ring-emerald-700 shrink-0 ml-2"
                    />
                  </div>

                  {/* Compensación Tentree / Reforestación Local (+1 Árbol) */}
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreeDeciduous className="h-4 w-4 text-teal-800 shrink-0" />
                      <span className="text-slate-700 text-[11px]">
                        <strong>Plantar 1 árbol con tu pedido (+0.80€):</strong> Proyecto de bosque autóctono en Castilla y León (estilo Tentree).
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={plantTree} 
                      onChange={(e) => setPlantTree(e.target.checked)}
                      className="rounded text-teal-800 focus:ring-teal-700 shrink-0 ml-2"
                    />
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
                      Transacciones cifradas con certificación SSL y protocolo 3D Secure.
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Editar datos
                  </button>
                </div>

                {/* Opciones de Pago */}
                <div className="space-y-3 text-xs">
                  {[
                    { id: 'tarjeta', label: '💳 Tarjeta de Crédito / Débito (Visa, Mastercard)', desc: 'Cifrado seguro bancario 256 bits' },
                    { id: 'bizum', label: '⚡ Bizum', desc: 'Pago instantáneo con tu número de teléfono' },
                    { id: 'apple_pay', label: '🍏 Apple Pay / Google Pay', desc: 'Pago en 1 toque desde tu móvil' },
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

                {paymentMethod === 'tarjeta' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Número de Tarjeta</label>
                      <Input placeholder="•••• •••• •••• ••••" className="rounded-xl bg-white h-10 font-mono text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Caducidad (MM/AA)</label>
                        <Input placeholder="MM/AA" className="rounded-xl bg-white h-10 font-mono text-xs" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">CVC / CVV</label>
                        <Input placeholder="•••" maxLength={4} className="rounded-xl bg-white h-10 font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 border">
                  <Lock className="h-4 w-4 text-emerald-800 shrink-0" />
                  <span>Entorno seguro garantizado. Tus datos financieros viajan encriptados de extremo a extremo.</span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    className="flex-1 rounded-2xl py-6 text-xs font-bold"
                  >
                    ← Modificar envío
                  </Button>
                  <Button 
                    onClick={handleProcessOrder}
                    disabled={isProcessing}
                    className="flex-2 bg-emerald-900 hover:bg-emerald-800 text-white font-black py-6 text-sm rounded-2xl shadow-md gap-2"
                  >
                    {isProcessing ? 'Procesando pago seguro...' : `Pagar ${finalTotal.toFixed(2)}€`}
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
              <Badge className="bg-emerald-100 text-emerald-900 border-0 text-[10px]">
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

            {/* Impacto Ambiental Sostenible */}
            <div className="p-3.5 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Impacto Positivo de tu Compra
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-800">
                  <span className="text-emerald-300 block text-[10px]">CO₂ evitado</span>
                  <strong className="font-mono text-white text-xs">~{estimatedCo2} kg CO₂e</strong>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-800">
                  <span className="text-emerald-300 block text-[10px]">Reforestación</span>
                  <strong className="text-white text-xs">{plantTree ? '🌳 +1 Árbol' : 'Sin árbol'}</strong>
                </div>
              </div>
            </div>

            {/* Desglose Económico */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal alimentos</span>
                <span className="font-mono">{totalPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Coste de entrega</span>
                <span className="font-mono font-bold text-emerald-800">
                  {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)}€`}
                </span>
              </div>
              {plantTree && (
                <div className="flex justify-between text-teal-800 font-medium">
                  <span>Plantar 1 árbol (Castilla y León)</span>
                  <span className="font-mono">+0.80€</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>IVA incluido (10%)</span>
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
