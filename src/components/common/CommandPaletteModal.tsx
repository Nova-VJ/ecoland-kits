import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  Package,
  ChefHat,
  Bot,
  Wallet,
  FileText,
  Droplet,
  Plus,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPantry?: () => void;
  onOpenRecipes?: () => void;
  onOpenBudget?: () => void;
  onOpenExport?: () => void;
  onAddWater?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenPantry,
  onOpenRecipes,
  onOpenBudget,
  onOpenExport,
  onAddWater
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Cerrar al pulsar Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Acciones disponibles
  const commands = [
    {
      id: 'nav_hoy',
      title: 'Ir a Ecoland Hoy',
      category: 'Navegación',
      icon: Calendar,
      action: () => {
        navigate('/hoy');
        onClose();
      }
    },
    {
      id: 'nav_semana',
      title: 'Ir a Plan Semanal & Días Flexibles',
      category: 'Navegación',
      icon: Calendar,
      action: () => {
        navigate('/semana');
        onClose();
      }
    },
    {
      id: 'nav_coach',
      title: 'Hablar con EcoCoach',
      category: 'Asistente',
      icon: Bot,
      action: () => {
        navigate('/coach');
        onClose();
      }
    },
    {
      id: 'open_pantry',
      title: 'Abrir Despensa Zero-Friction',
      category: 'Despensa',
      icon: Package,
      action: () => {
        onClose();
        if (onOpenPantry) onOpenPantry();
      }
    },
    {
      id: 'open_recipes',
      title: 'Recipe Inbox & Modo Cocina 2.0',
      category: 'Cocina',
      icon: ChefHat,
      action: () => {
        onClose();
        if (onOpenRecipes) onOpenRecipes();
      }
    },
    {
      id: 'open_budget',
      title: 'Ver Presupuesto Familiar & Gastos',
      category: 'Economía',
      icon: Wallet,
      action: () => {
        onClose();
        if (onOpenBudget) onOpenBudget();
      }
    },
    {
      id: 'open_export',
      title: 'Exportar Informe Nutricional para Médico/Dietista',
      category: 'Salud',
      icon: FileText,
      action: () => {
        onClose();
        if (onOpenExport) onOpenExport();
      }
    },
    {
      id: 'quick_water',
      title: 'Registrar 1 vaso de agua (+250 ml)',
      category: 'Registro Rápido',
      icon: Droplet,
      action: () => {
        onClose();
        if (onAddWater) onAddWater();
      }
    }
  ];

  const filteredCommands = commands.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden text-slate-900 flex flex-col"
        >
          {/* Input Buscador */}
          <div className="p-4 border-b flex items-center gap-3 bg-slate-50/70">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Escribe un comando o busca una sección... (ej. despensa, agua, presupuesto)"
              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <Badge variant="outline" className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
              ESC para cerrar
            </Badge>
          </div>

          {/* Listado de comandos */}
          <div className="p-2 max-h-80 overflow-y-auto space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No se encontraron comandos que coincidan con tu búsqueda.
              </div>
            ) : (
              filteredCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full p-2.5 rounded-2xl flex items-center justify-between text-left hover:bg-emerald-50/70 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-900 flex items-center justify-center text-slate-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block group-hover:text-emerald-950">
                          {cmd.title}
                        </strong>
                        <span className="text-[10px] text-slate-400">{cmd.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 transition-colors mr-1" />
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPaletteModal;
