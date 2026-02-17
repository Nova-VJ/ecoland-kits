import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  onAccept: () => void;
}

export const EcoCoachTerms = ({ onAccept }: Props) => {
  const [accepted, setAccepted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4"
    >
      <div className="flex items-center gap-2 text-primary">
        <Shield className="h-5 w-5" />
        <h4 className="font-semibold text-sm">Términos de uso del Eco-Coach</h4>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Antes de empezar, necesitamos que aceptes nuestras condiciones de uso.
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Ocultar' : 'Leer'} términos y condiciones
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-muted/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-2 max-h-48 overflow-y-auto"
        >
          <p className="font-semibold text-foreground">Condiciones de uso de Eco-Coach IA</p>
          <p>1. <strong>Eco-Coach no es un sustituto de un profesional de la salud.</strong> Las recomendaciones dietéticas proporcionadas son orientativas y no constituyen asesoramiento médico, nutricional profesional ni diagnóstico alguno.</p>
          <p>2. Al aceptar estos términos, el usuario reconoce que Eco-Coach le recomendará dietas y productos basándose en la información proporcionada por el propio usuario (objetivos, preferencias, restricciones alimentarias).</p>
          <p>3. El usuario es responsable de consultar con un profesional de la nutrición o médico antes de realizar cambios significativos en su dieta, especialmente si padece alguna condición médica, alergias o intolerancias graves.</p>
          <p>4. Eco Land no se hace responsable de los efectos que pueda tener seguir las recomendaciones de Eco-Coach sin supervisión profesional.</p>
          <p>5. Los datos de las conversaciones se almacenan de forma segura y privada en tu perfil de usuario para que puedas consultarlas posteriormente.</p>
          <p>6. Todos los productos recomendados pertenecen al catálogo de Eco Land y están sujetos a disponibilidad.</p>
        </motion.div>
      )}

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
          He leído y acepto los términos y condiciones. Entiendo que Eco-Coach <strong>no sustituye</strong> el consejo de un profesional de la salud.
        </label>
      </div>

      <Button
        onClick={onAccept}
        disabled={!accepted}
        size="sm"
        className="w-full"
      >
        Aceptar y continuar
      </Button>
    </motion.div>
  );
};
