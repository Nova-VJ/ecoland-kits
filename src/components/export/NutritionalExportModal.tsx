import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  nutritionalExportService,
  NutritionalReportSummary
} from '@/services/nutritionalExportService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  FileText,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Calendar,
  Heart,
  Droplets,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NutritionalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NutritionalExportModal: React.FC<NutritionalExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [report, setReport] = useState<NutritionalReportSummary>(() =>
    nutritionalExportService.generateReport()
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Informe copiado",
      description: "Los datos nutricionales se han copiado al portapapeles."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent = nutritionalExportService.exportAsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecoland_informe_nutricional_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Descarga completada",
      description: "Archivo CSV generado para tu profesional de la salud."
    });
  };

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
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Exportar Informe de Hábitos para Profesionales
                  </h2>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300">
                    P4 Export
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Resumen de ingestas, fibra prebiótica y Food Fingerprint para tu dietista o médico
                </p>
              </div>
            </div>

            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            {/* Aviso Médico Obligatorio */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-tight">
                <strong className="block text-[11px] font-bold">Aviso Ético y Legal (No Diagnóstico)</strong>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {report.legalMedicalDisclaimer}
                </p>
              </div>
            </div>

            {/* Tarjetas de Promedios */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 border rounded-2xl">
                <span className="text-xs text-slate-500 block font-bold uppercase">Calorías Medias</span>
                <strong className="text-lg font-black text-slate-900 tabular-nums">
                  {report.nutritionalAverages.averageCalories} kcal
                </strong>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <span className="text-xs text-emerald-800 block font-bold uppercase">Fibra Diaria</span>
                <strong className="text-lg font-black text-emerald-950 tabular-nums">
                  {report.nutritionalAverages.averageFiberGrams} g
                </strong>
                <span className="text-xs text-emerald-700 block">{report.nutritionalAverages.fiberGoalMetPercent}% del objetivo</span>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl">
                <span className="text-xs text-blue-800 block font-bold uppercase">Proteína Media</span>
                <strong className="text-lg font-black text-blue-950 tabular-nums">
                  {report.nutritionalAverages.averageProteinGrams} g
                </strong>
              </div>

              <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-2xl">
                <span className="text-xs text-cyan-800 block font-bold uppercase">Agua Promedio</span>
                <strong className="text-lg font-black text-cyan-950 tabular-nums">
                  ~{report.nutritionalAverages.averageWaterGlasses * 250} ml
                </strong>
                <span className="text-xs text-cyan-700 block">{report.nutritionalAverages.averageWaterGlasses} vasos/día</span>
              </div>
            </div>

            {/* Food Fingerprint del Usuario */}
            <div className="p-4 bg-white border rounded-2xl space-y-2 shadow-2xs">
              <strong className="text-xs font-bold text-slate-800 block">
                Perfil Food Fingerprint Declarado:
              </strong>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {report.foodFingerprintProfile.isGlutenFree && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300">
                    Sin Gluten
                  </Badge>
                )}
                {report.foodFingerprintProfile.isLactoseFree && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300">
                    Sin Lactosa
                  </Badge>
                )}
                {report.foodFingerprintProfile.isVegan && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300">
                    Vegano
                  </Badge>
                )}
                {report.foodFingerprintProfile.declaredAllergies.length > 0 ? (
                  report.foodFingerprintProfile.declaredAllergies.map((al, idx) => (
                    <Badge key={idx} variant="destructive" className="text-xs">
                      Alergia: {al}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500">Sin alergias declaradas registradas.</span>
                )}
              </div>
            </div>

            {/* Alimentos Habituales */}
            <div className="p-4 bg-white border rounded-2xl space-y-2 shadow-2xs">
              <strong className="text-xs font-bold text-slate-800 block">
                Frecuencia de Consumo de Grupos de Alimentos:
              </strong>
              <div className="space-y-1.5">
                {report.habitualFoodsFrequent.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div>
                      <strong className="text-slate-900 block text-xs">{item.name}</strong>
                      <span className="text-xs text-slate-500">{item.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {item.estimatedFrequency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="p-4 border-t bg-slate-50/70 flex items-center justify-between">
            <span className="text-[11px] tabular-nums text-slate-500">
              Reporte ID: {report.reportId}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-xl text-xs gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </Button>
              <Button size="sm" onClick={handleDownloadCsv} className="bg-emerald-800 text-white font-bold rounded-xl text-xs gap-1.5 px-4">
                <Download className="w-3.5 h-3.5" />
                <span>Descargar CSV</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NutritionalExportModal;
