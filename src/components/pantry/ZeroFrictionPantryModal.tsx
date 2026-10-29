import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  zeroFrictionPantryService,
  DomesticPantryItem,
  PantryLocation,
  OrderToPantryPrompt,
  TicketOcrResult,
  ReplenishmentSuggestion
} from '@/services/zeroFrictionPantryService';
import { offlineSyncService } from '@/services/offlineSyncService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Snowflake,
  Clock,
  Sparkles,
  RotateCcw,
  Receipt,
  ShoppingCart,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ChefHat
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ZeroFrictionPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemConsumedToDaily?: (itemName: string) => void;
}

export const ZeroFrictionPantryModal: React.FC<ZeroFrictionPantryModalProps> = ({
  isOpen,
  onClose,
  onItemConsumedToDaily
}) => {
  const [items, setItems] = useState<DomesticPantryItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PantryLocation | 'TODAS' | 'SOBRAS'>('TODAS');
  const [auditMode, setAuditMode] = useState(false);
  const [auditItems, setAuditItems] = useState<DomesticPantryItem[]>([]);
  const [currentAuditIdx, setCurrentAuditIdx] = useState(0);

  // Pedido entregado simulación / prompt
  const [orderPrompt, setOrderPrompt] = useState<OrderToPantryPrompt | null>(null);
  const [autoImportPref, setAutoImportPref] = useState(false);

  // Ticket OCR
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrResult, setOcrResult] = useState<TicketOcrResult | null>(null);

  // Nueva sobra modal
  const [showLeftoverModal, setShowLeftoverModal] = useState(false);
  const [leftoverName, setLeftoverName] = useState('');
  const [leftoverPortions, setLeftoverPortions] = useState(2);
  const [leftoverLocation, setLeftoverLocation] = useState<'NEVERA' | 'CONGELADOR'>('NEVERA');

  // Reposición sugerencias
  const [suggestions, setSuggestions] = useState<ReplenishmentSuggestion[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const list = zeroFrictionPantryService.getPantryItems();
    setItems(list);
    setAutoImportPref(zeroFrictionPantryService.isAutoImportEnabled());
    setSuggestions(zeroFrictionPantryService.getReplenishmentSuggestions());

    // Crear un prompt de pedido simulado entregado para demostración
    const prompt = zeroFrictionPantryService.createDeliveredOrderPrompt('ECO-DELIV-908', [
      { name: 'Aceite de oliva virgen extra eco 750ml', quantity: 1, unit: 'l', category: 'despensa' },
      { name: 'Kéfir de cabra artesano', quantity: 2, unit: 'uds', category: 'lacteos' },
      { name: 'Zanahorias de cultivo biodinámico', quantity: 1, unit: 'kg', category: 'frescos' }
    ]);
    setOrderPrompt(prompt);
  };

  const handleUpdateStatus = (
    itemId: string,
    status: 'QUEDA_BASTANTE' | 'QUEDA_POCO' | 'SE_ACABO' | 'CONSUMIDO' | 'LO_TIRE' | 'CONGELADO',
    syncToDaily = false
  ) => {
    // Si estamos en modo offline o multi-dispositivo, encolar como mutación
    offlineSyncService.queueMutation({
      entity: 'PANTRY',
      operation: status === 'CONSUMIDO' ? 'CONSUME_DELTA' : 'UPDATE',
      payload: { itemId, status, deltaQuantity: -1 }
    });

    const updated = zeroFrictionPantryService.updateQuickStatus(itemId, status, { syncToDaily });
    if (updated && syncToDaily && onItemConsumedToDaily) {
      onItemConsumedToDaily(updated.name);
    }
    loadData();
  };

  const startAuditMode = () => {
    const pending = zeroFrictionPantryService.getPendingAuditItems();
    setAuditItems(pending);
    setCurrentAuditIdx(0);
    setAuditMode(true);
  };

  const handleAuditAction = (action: 'ESTA_BIEN' | 'QUEDA_POCO' | 'SE_ACABO' | 'NO_LO_TENGO') => {
    if (auditItems[currentAuditIdx]) {
      zeroFrictionPantryService.auditItem(auditItems[currentAuditIdx].id, action);
    }
    if (currentAuditIdx + 1 < auditItems.length) {
      setCurrentAuditIdx(currentAuditIdx + 1);
    } else {
      setAuditMode(false);
      loadData();
    }
  };

  const handleImportOrderAll = () => {
    if (!orderPrompt) return;
    zeroFrictionPantryService.importDeliveredOrder(orderPrompt);
    setOrderPrompt(null);
    loadData();
  };

  const handleToggleAutoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setAutoImportPref(val);
    zeroFrictionPantryService.setAutoImportPreference(val);
  };

  const handleSaveLeftover = () => {
    if (!leftoverName.trim()) return;
    zeroFrictionPantryService.addLeftover({
      name: leftoverName.trim(),
      portions: leftoverPortions,
      location: leftoverLocation
    });
    setLeftoverName('');
    setShowLeftoverModal(false);
    loadData();
  };

  const handleSimulateTicketOcr = () => {
    const result = zeroFrictionPantryService.parseTicketOcr('Ticket supermercado');
    setOcrResult(result);
    setShowOcrModal(true);
  };

  const handleConfirmTicketImport = () => {
    if (!ocrResult) return;
    zeroFrictionPantryService.importReviewedTicket(ocrResult);
    setShowOcrModal(false);
    setOcrResult(null);
    loadData();
  };

  // Filtrado de items
  const filteredItems = items.filter(it => {
    if (selectedLocation === 'TODAS') return it.freshnessState !== 'CONSUMIDO';
    if (selectedLocation === 'SOBRAS') return it.type === 'LEFTOVER' && it.freshnessState !== 'CONSUMIDO';
    return it.location === selectedLocation && it.freshnessState !== 'CONSUMIDO';
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Despensa Zero-Friction
                  </h2>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300">
                    P3-D Core
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Inventario doméstico sin trabajo manual · Fechas honestas · Sincronización offline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startAuditMode}
                className="rounded-xl text-xs font-bold gap-1.5 border-emerald-300 text-emerald-900 hover:bg-emerald-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Revisar mi despensa</span>
              </Button>
              <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full w-8 h-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Prompt Pedido Ecoland Entregado */}
          {orderPrompt && (
            <div className="px-5 py-3 bg-emerald-50/90 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Package className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-emerald-950 font-bold block">
                    Tu pedido Ecoland #{orderPrompt.orderId} ha llegado. ¿Quieres añadirlo a tu despensa?
                  </strong>
                  <span className="text-[11px] text-emerald-800">
                    {orderPrompt.items.map(i => `${i.name} (${i.quantity}${i.unit})`).join(' · ')}
                  </span>
                  <label className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-900 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={autoImportPref}
                      onChange={handleToggleAutoImport}
                      className="rounded text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>Añadir automáticamente futuros pedidos (Opt-in)</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" onClick={handleImportOrderAll} className="bg-emerald-800 text-white font-bold rounded-xl text-xs h-7 px-3">
                  Añadir todo
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOrderPrompt(null)} className="rounded-xl text-xs h-7 text-emerald-900">
                  No ahora
                </Button>
              </div>
            </div>
          )}

          {/* Modal de Auditoría Rápida (Card View) */}
          {auditMode && (
            <div className="p-6 bg-slate-100 border-b flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex items-center justify-between w-full max-w-md">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Auditoría Rápida ({currentAuditIdx + 1} de {auditItems.length})
                </span>
                <Button size="sm" variant="ghost" onClick={() => setAuditMode(false)} className="text-xs h-6">
                  Finalizar
                </Button>
              </div>

              {auditItems[currentAuditIdx] && (
                <div className="bg-white p-5 rounded-2xl border shadow-sm w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {auditItems[currentAuditIdx].location}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Cantidad: {auditItems[currentAuditIdx].quantity} {auditItems[currentAuditIdx].unit}
                    </span>
                  </div>
                  <strong className="text-base font-bold text-slate-900 block">
                    {auditItems[currentAuditIdx].name}
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAuditAction('ESTA_BIEN')}
                      className="bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Está bien
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAuditAction('QUEDA_POCO')}
                      className="rounded-xl text-xs border-amber-300 text-amber-900 bg-amber-50"
                    >
                      Queda poco
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAuditAction('SE_ACABO')}
                      className="rounded-xl text-xs border-rose-300 text-rose-900 bg-rose-50"
                    >
                      Se acabó
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAuditAction('NO_LO_TENGO')}
                      className="rounded-xl text-xs text-slate-500"
                    >
                      No lo tengo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Barra de Filtros de Ubicación & Acciones rápidas */}
          <div className="p-3 sm:p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'TODAS', label: 'Todas' },
                { id: 'DESPENSA', label: 'Despensa' },
                { id: 'NEVERA', label: 'Nevera' },
                { id: 'CONGELADOR', label: 'Congelador' },
                { id: 'BEBIDAS', label: 'Bebidas' },
                { id: 'SOBRAS', label: '🍲 Sobras' }
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedLocation === loc.id
                      ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLeftoverModal(true)}
                className="rounded-xl text-xs h-8 gap-1.5 font-medium border-slate-300"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-800" />
                <span>Registrar Sobra / Tupper</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSimulateTicketOcr}
                className="rounded-xl text-xs h-8 gap-1.5 font-medium border-slate-300"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-700" />
                <span>Escanear Ticket OCR</span>
              </Button>
            </div>
          </div>

          {/* Grid de Items de Despensa */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Sección Sugerencias de Reposición si existen */}
            {suggestions.filter(s => s.status === 'PENDING').length > 0 && (
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <ShoppingCart className="w-4 h-4 text-amber-800" />
                  <span>Sugerencias éticas de reposición (Sin auto-carrito):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.filter(s => s.status === 'PENDING').map(sug => (
                    <div key={sug.itemId} className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div>
                        <strong className="text-slate-900 block">{sug.productName}</strong>
                        <span className="text-xs text-amber-700">Motivo: {sug.reason === 'SE_ACABO' ? 'Se acabó en despensa' : 'Queda poco'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            zeroFrictionPantryService.handleReplenishmentDecision(sug.itemId, 'ANADIR_A_LISTA');
                            loadData();
                          }}
                          className="bg-emerald-800 text-white rounded-lg text-xs h-6 px-2"
                        >
                          Añadir a lista
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            zeroFrictionPantryService.handleReplenishmentDecision(sug.itemId, 'TENGO_SUFICIENTE');
                            loadData();
                          }}
                          className="text-xs h-6 px-2"
                        >
                          Tengo suficiente
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No hay productos registrados en esta ubicación.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItems.map(item => {
                  const dateInfo = zeroFrictionPantryService.getDisplayDateInfo(item);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-sm font-bold text-slate-900">
                              {item.name}
                            </strong>
                            {item.type === 'LEFTOVER' && (
                              <Badge className="bg-purple-100 text-purple-900 border-none text-xs font-bold">
                                Sobra / Tupper
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {item.quantity} {item.unit} · {item.location}
                          </span>
                        </div>

                        {/* Badge de Honestidad de Fechas */}
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            dateInfo.badgeStyle === 'real'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : dateInfo.badgeStyle === 'frozen'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {dateInfo.displayText}
                        </Badge>
                      </div>

                      {/* Botones de Estado Rápido 1-Tap */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-[11px]">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(item.id, 'QUEDA_POCO')}
                          className="rounded-xl h-6 text-xs px-2 font-medium border-amber-200 text-amber-900 hover:bg-amber-50"
                        >
                          Queda poco
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(item.id, 'CONSUMIDO', true)}
                          className="rounded-xl h-6 text-xs px-2 font-bold bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                        >
                          Consumí esto (+diario)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(item.id, 'CONGELADO')}
                          className="rounded-xl h-6 text-xs px-2 font-medium border-blue-200 text-blue-900 hover:bg-blue-50"
                        >
                          Congelar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(item.id, 'SE_ACABO')}
                          className="rounded-xl h-6 text-xs px-2 text-rose-700 hover:bg-rose-50"
                        >
                          Se acabó
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal para Añadir Sobra / Tupper */}
          {showLeftoverModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="bg-white p-5 rounded-2xl border shadow-xl w-full max-w-sm space-y-3 text-xs">
                <strong className="text-sm font-bold text-slate-900 block">
                  Registrar Sobra / Comida Cocinada
                </strong>
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Nombre del plato:</span>
                  <Input
                    value={leftoverName}
                    onChange={e => setLeftoverName(e.target.value)}
                    placeholder="Ej: Arroz con verduras, lentejas..."
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-medium">Raciones:</span>
                    <Input
                      type="number"
                      value={leftoverPortions}
                      onChange={e => setLeftoverPortions(Number(e.target.value))}
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Ubicación:</span>
                    <select
                      value={leftoverLocation}
                      onChange={e => setLeftoverLocation(e.target.value as any)}
                      className="w-full h-9 border rounded-xl px-2 text-xs bg-white"
                    >
                      <option value="NEVERA">Nevera (consumir pronto)</option>
                      <option value="CONGELADOR">Congelador (larga duración)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button size="sm" variant="ghost" onClick={() => setShowLeftoverModal(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveLeftover} className="bg-emerald-800 text-white font-bold rounded-xl">
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Modal para Ticket OCR con Revisión Humana */}
          {showOcrModal && ocrResult && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white p-5 rounded-2xl border shadow-xl w-full max-w-lg space-y-3 text-xs max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-2">
                  <strong className="text-sm font-bold text-slate-900">
                    Revisión de Ticket OCR (Obligatoria antes de guardar)
                  </strong>
                  <Button size="icon" variant="ghost" onClick={() => setShowOcrModal(false)} className="w-6 h-6">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Separamos automáticamente ALIMENTACIÓN de HOGAR. Revisa las casillas antes de confirmar:
                </p>

                <div className="space-y-2">
                  {ocrResult.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-2.5 rounded-xl border flex items-center justify-between gap-2 bg-slate-50"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={it.selectedForImport}
                          onChange={e => {
                            const updated = { ...ocrResult };
                            updated.items[idx].selectedForImport = e.target.checked;
                            setOcrResult(updated);
                          }}
                          className="rounded text-emerald-800"
                        />
                        <div>
                          <strong className="text-slate-900 block">{it.suggestedName}</strong>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {it.quantity} {it.unit} · {formatPrice(it.priceEur)}
                          </span>
                        </div>
                      </label>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          it.categoryType === 'ALIMENTACIÓN'
                            ? 'bg-emerald-100 text-emerald-900 border-none'
                            : it.categoryType === 'HOGAR'
                            ? 'bg-amber-100 text-amber-900 border-none'
                            : 'bg-slate-200 text-slate-700 border-none'
                        }`}
                      >
                        {it.categoryType}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="tabular-nums font-bold text-slate-800">
                    Total Ticket: {formatPrice(ocrResult.totalEur)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowOcrModal(false)}>
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmTicketImport}
                      className="bg-emerald-800 text-white font-bold rounded-xl"
                    >
                      Importar Seleccionados
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ZeroFrictionPantryModal;
