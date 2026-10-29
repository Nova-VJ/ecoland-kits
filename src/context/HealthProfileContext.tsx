import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EMPTY_PROFILE, type HealthProfile } from '@/lib/saludEngine';
import type { AllergenId } from '@/data/catalog/productFacts';

/**
 * Perfil de Ecoland Salud.
 * - Modo dispositivo (por defecto): se guarda solo en este navegador; Ecoland no recibe ningún dato de salud.
 * - Modo cuenta: solo tras consentimiento explícito (RGPD art. 9). Cada persona puede borrarlo cuando quiera.
 */

const LOCAL_KEY = 'ecoland-salud-perfil';
export const CONSENT_VERSION = 'salud-v1-2026-10';

type StorageMode = 'dispositivo' | 'cuenta';

interface HealthProfileContextType {
  profile: HealthProfile;
  mode: StorageMode;
  consentGivenAt: string | null;
  isLoggedIn: boolean;
  toggleNeed: (needId: string) => void;
  toggleAllergen: (allergen: AllergenId) => void;
  clearProfile: () => void;
  /** Guarda el perfil en la cuenta. Llamar solo después de que la persona haya aceptado el consentimiento. */
  saveToAccount: () => Promise<{ ok: boolean; error?: string }>;
  /** Borra el perfil de la cuenta (y de este dispositivo) */
  deleteFromAccount: () => Promise<{ ok: boolean; error?: string }>;
}

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

const readLocal = (): HealthProfile => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { needs: parsed.needs ?? [], avoidAllergens: parsed.avoidAllergens ?? [] };
    }
  } catch {
    // almacenamiento no disponible: empezamos con el perfil vacío
  }
  return EMPTY_PROFILE;
};

const writeLocal = (profile: HealthProfile) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  } catch {
    // sin almacenamiento: el perfil dura solo esta visita
  }
};

// La tabla health_profiles es nueva y aún no está en los tipos generados de Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const healthTable = () => supabase.from('health_profiles' as never) as any;

export const HealthProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<HealthProfile>(readLocal);
  const [mode, setMode] = useState<StorageMode>('dispositivo');
  const [consentGivenAt, setConsentGivenAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Al iniciar sesión, si la persona ya guardó su perfil en la cuenta, lo recuperamos
  useEffect(() => {
    const load = async (id: string | null) => {
      setUserId(id);
      if (!id) {
        setMode('dispositivo');
        setConsentGivenAt(null);
        return;
      }
      const { data, error } = await healthTable().select('needs, avoid_allergens, consent_given_at').eq('user_id', id).maybeSingle();
      if (error || !data) return;
      const saved = { needs: data.needs ?? [], avoidAllergens: data.avoid_allergens ?? [] };
      setProfile(saved);
      writeLocal(saved);
      setMode('cuenta');
      setConsentGivenAt(data.consent_given_at);
    };
    supabase.auth.getUser().then(({ data: { user } }) => load(user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => load(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const persist = useCallback((next: HealthProfile) => {
    setProfile(next);
    writeLocal(next);
    if (mode === 'cuenta' && userId) {
      healthTable()
        .update({ needs: next.needs, avoid_allergens: next.avoidAllergens, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .then(() => undefined);
    }
  }, [mode, userId]);

  const toggleNeed = (needId: string) => {
    const needs = profile.needs.includes(needId) ? profile.needs.filter(n => n !== needId) : [...profile.needs, needId];
    persist({ ...profile, needs });
  };

  const toggleAllergen = (allergen: AllergenId) => {
    const avoidAllergens = profile.avoidAllergens.includes(allergen)
      ? profile.avoidAllergens.filter(a => a !== allergen)
      : [...profile.avoidAllergens, allergen];
    persist({ ...profile, avoidAllergens });
  };

  const clearProfile = () => persist(EMPTY_PROFILE);

  const saveToAccount = async () => {
    if (!userId) return { ok: false, error: 'Inicia sesión para guardar tu perfil en tu cuenta.' };
    const now = new Date().toISOString();
    const { error } = await healthTable().upsert({
      user_id: userId,
      needs: profile.needs,
      avoid_allergens: profile.avoidAllergens,
      consent_given_at: now,
      consent_version: CONSENT_VERSION,
      updated_at: now,
    });
    if (error) return { ok: false, error: 'No hemos podido guardarlo en tu cuenta. Sigue guardado en este dispositivo.' };
    setMode('cuenta');
    setConsentGivenAt(now);
    return { ok: true };
  };

  const deleteFromAccount = async () => {
    if (userId) {
      const { error } = await healthTable().delete().eq('user_id', userId);
      if (error) return { ok: false, error: 'No hemos podido borrarlo. Inténtalo de nuevo.' };
    }
    setMode('dispositivo');
    setConsentGivenAt(null);
    setProfile(EMPTY_PROFILE);
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
      // nada que borrar
    }
    return { ok: true };
  };

  return (
    <HealthProfileContext.Provider
      value={{ profile, mode, consentGivenAt, isLoggedIn: Boolean(userId), toggleNeed, toggleAllergen, clearProfile, saveToAccount, deleteFromAccount }}
    >
      {children}
    </HealthProfileContext.Provider>
  );
};

export const useHealthProfile = () => {
  const ctx = useContext(HealthProfileContext);
  if (!ctx) throw new Error('useHealthProfile debe usarse dentro de HealthProfileProvider');
  return ctx;
};
