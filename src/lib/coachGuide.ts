import type { AppSection } from '@/data/appSections';

// Abre EcoCoach en modo guía (explicación de las funciones) desde cualquier parte de la app.
export const COACH_GUIDE_EVENT = 'ecoland-coach-guia';

export function openCoachGuide(sectionId?: AppSection['id']) {
  window.dispatchEvent(new CustomEvent(COACH_GUIDE_EVENT, { detail: { sectionId } }));
}
