import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  householdBudgetService,
  BudgetFinancialSummary,
  ExpenseRecord
} from '@/services/householdBudgetService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  X,
  Wallet,
  TrendingDown,
  Sparkles,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Plus,
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';

interface HouseholdBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HouseholdBudgetModal: React.FC<HouseholdBudgetModalProps> = ({
  isOpen,
  onClose
}) => {
  const [summary, setSummary] = useState<BudgetFinancialSummary>(() =>
    householdBudgetService.getFinancialSummary()
  );
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() =>
    householdBudgetService.getExpenses()
  );
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<'frescos' | 'despensa' | 'general'>('frescos');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setSummary(householdBudgetService.getFinancialSummary());
    setExpenses(householdBudgetService.getExpenses());
  };

  const handleCreateExpense = () => {
    const amount = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(amount) || amount <= 0) return;

    householdBudgetService.addExpense({
      date: new Date().toISOString().split('T')[0],
      source: 'MANUAL',
      description: newDesc.trim(),
      amountEuro: amount,
      category: newCategory
    });

    setNewDesc('');
    setNewAmount('');
    setShowAddExpense(false);
    loadData();
  };

  if (!isOpen || !summary) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Presupuesto Familiar & Control de Gasto
                  </h2>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                    P4 Core
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Control real de compras de alimentación · Ahorro por despensa · Coste por ración
                </p>
              </div>
            </div>

            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            {/* Tarjetas Métricas Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Gastado este mes
                </span>
                <strong className="text-lg sm:text-xl font-black text-slate-900 block font-mono">
                  {summary.currentMonthSpentEuro.toFixed(2)} €
                </strong>
                <span className="text-[10px] text-slate-500">de {summary.monthlyCapEuro} € tope</span>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                  Presupuesto restante
                </span>
                <strong className="text-lg sm:text-xl font-black text-emerald-950 block font-mono">
                  {summary.remainingBudgetEuro.toFixed(2)} €
                </strong>
                <span className="text-[10px] text-emerald-700">disponible este mes</span>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-800 block tracking-wider">
                  Coste medio ración
                </span>
                <strong className="text-lg sm:text-xl font-black text-blue-950 block font-mono">
                  ~{summary.averageCostPerServingEuro.toFixed(2)} €
                </strong>
                <span className="text-[10px] text-blue-700">por plato cocinado</span>
              </div>

              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-800 block tracking-wider">
                  Ahorro en despensa
                </span>
                <strong className="text-lg sm:text-xl font-black text-purple-950 block font-mono">
                  +{summary.pantrySavingsTotalEuro.toFixed(2)} €
                </strong>
                <span className="text-[10px] text-purple-700">evitado en compras</span>
              </div>
            </div>

            {/* Barra de Progreso del Presupuesto */}
            <div className="p-4 bg-white border rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-slate-700">Progreso del presupuesto mensual:</span>
                <span className="font-mono text-emerald-900">{summary.burnRatePercent}% consumido</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    summary.status === 'EXCEEDED'
                      ? 'bg-rose-500'
                      : summary.status === 'NEAR_LIMIT'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, summary.burnRatePercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {summary.adviceMessage}
              </p>
            </div>

            {/* Sección de Gastos Recientes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Gastos de alimentación registrados ({expenses.length}):
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddExpense(!showAddExpense)}
                  className="rounded-xl text-xs h-7 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Gasto</span>
                </Button>
              </div>

              {/* Formulario añadir gasto */}
              {showAddExpense && (
                <div className="p-3.5 bg-slate-50 border rounded-2xl space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Concepto (ej. Frutería, pan...)"
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      className="text-xs bg-white rounded-xl"
                    />
                    <Input
                      placeholder="Importe (€)"
                      type="number"
                      step="0.01"
                      value={newAmount}
                      onChange={e => setNewAmount(e.target.value)}
                      className="text-xs bg-white rounded-xl font-mono"
                    />
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value as any)}
                        className="w-full h-9 border rounded-xl px-2 text-xs bg-white"
                      >
                        <option value="frescos">Frescos</option>
                        <option value="despensa">Despensa</option>
                        <option value="general">General</option>
                      </select>
                      <Button size="sm" onClick={handleCreateExpense} className="bg-emerald-800 text-white rounded-xl text-xs font-bold px-3">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {expenses.map(exp => (
                  <div
                    key={exp.id}
                    className="p-3 bg-white border rounded-xl flex items-center justify-between gap-2 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        {exp.source === 'ECOLAND_ORDER' ? (
                          <Package className="w-3.5 h-3.5 text-emerald-800" />
                        ) : (
                          <Receipt className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <strong className="text-slate-900 block text-xs">{exp.description}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {exp.date} · {exp.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {exp.amountEuro.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer accesible */}
          <div className="p-4 border-t bg-slate-50 flex items-center justify-end">
            <Button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-5 h-9"
            >
              Entendido
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HouseholdBudgetModal;
