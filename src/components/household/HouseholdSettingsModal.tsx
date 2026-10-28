import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Copy, Check, UserPlus, Home, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dailyNutritionStore, Household } from '@/services/dailyNutritionStore';

interface HouseholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HouseholdSettingsModal = ({ isOpen, onClose }: HouseholdSettingsModalProps) => {
  const { toast } = useToast();
  const [household, setHousehold] = useState<Household>(() => 
    dailyNutritionStore.getHousehold() || dailyNutritionStore.createOrUpdateHousehold('Mi Hogar Ecoland')
  );

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({ title: "Código de invitación copiado" });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const updated = dailyNutritionStore.addHouseholdMember(newName, newEmail);
    setHousehold({ ...updated });
    setNewName('');
    setNewEmail('');

    toast({
      title: "Miembro invitado al hogar",
      description: `Se ha enviado invitación a ${newName} (${newEmail}). Podrá colaborar en la despensa y lista de compra.`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Hogar Ecoland Colaborativo</h3>
              <p className="text-[11px] text-emerald-300">Comparte despensa y lista de compra con tu familia</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Tarjeta de Código de Invitación */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Código de Familia</span>
              <strong className="text-base font-mono font-black text-emerald-950 tracking-wider">
                {household.code}
              </strong>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 font-bold text-xs rounded-xl gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar código'}</span>
            </Button>
          </div>

          {/* Garantía de Privacidad Ética */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1.5 text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Privacidad por diseño en el hogar:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white p-2 rounded-xl border">
                <strong className="text-emerald-950 block mb-0.5">✓ Se comparte:</strong>
                <p className="text-slate-500">Despensa casera, lista de compra unificada, planes semanales y recetas familiares.</p>
              </div>
              <div className="bg-white p-2 rounded-xl border">
                <strong className="text-slate-900 block mb-0.5">🔒 Estrictamente privado:</strong>
                <p className="text-slate-500">Tu diario individual, peso, calorías consumidas y objetivos biométricos personales.</p>
              </div>
            </div>
          </div>

          {/* Miembros del Hogar */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-800 block uppercase tracking-wider">
              Miembros ({household.members.length}):
            </span>
            <div className="space-y-1.5">
              {household.members.map((m) => (
                <div 
                  key={m.id}
                  className="p-2.5 rounded-xl border bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="block text-slate-900 text-xs">{m.name}</strong>
                      <span className="text-[10px] text-slate-400">{m.email}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {m.role === 'OWNER' ? 'Titular' : 'Colaborador'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario para Invitar Miembro */}
          <form onSubmit={handleAddMember} className="p-4 rounded-2xl border bg-slate-50/50 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-800 block">Invitar a un nuevo miembro:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Nombre (ej: Laura)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-xs bg-white rounded-xl"
              />
              <Input
                type="email"
                placeholder="Email (ej: laura@ejemplo.com)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-9 text-xs bg-white rounded-xl"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enviar invitación al hogar</span>
            </Button>
          </form>

        </div>

        <div className="p-3.5 bg-slate-50 border-t flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl"
          >
            Cerrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
