import React, { useEffect, useState } from 'react';
import { offlineSyncService, NetworkIndicatorState } from '@/services/offlineSyncService';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineIndicatorBar: React.FC = () => {
  const [networkState, setNetworkState] = useState<NetworkIndicatorState>(() =>
    offlineSyncService.getNetworkState()
  );

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((state) => {
      setNetworkState(state);
    });
    return () => unsubscribe();
  }, []);

  // Si está online y no hay cambios pendientes, mostramos un badge sutil y minimalista
  if (networkState.isOnline && networkState.pendingCount === 0 && networkState.status === 'ONLINE_SYNCED') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-xs text-emerald-800 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Todo sincronizado</span>
      </div>
    );
  }

  // Estado Sincronizando
  if (networkState.status === 'SYNCING') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800 font-medium animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
        <span>Sincronizando cambios...</span>
      </div>
    );
  }

  // Estado Sin Conexión o Pendientes
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border shadow-2xs transition-all ${
        !networkState.isOnline
          ? 'bg-amber-500 text-white border-amber-600'
          : 'bg-amber-50 text-amber-900 border-amber-300'
      }`}
    >
      {!networkState.isOnline ? (
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <Wifi className="w-3.5 h-3.5 shrink-0 text-amber-700" />
      )}
      <span>{networkState.label}</span>
    </div>
  );
};

export default OfflineIndicatorBar;
