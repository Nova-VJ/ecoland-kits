import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';
import { APP_SECTIONS, type AppSection } from '@/data/appSections';

/**
 * EcoCoach en modo guía: explica qué hay en cada sección y cómo se usa cada función.
 * No necesita IA ni aceptar condiciones: es la ayuda de la app.
 */
export function CoachGuide({
  initialSection,
  onNavigate,
  onChat,
}: {
  initialSection?: AppSection['id'];
  onNavigate: () => void;
  onChat: () => void;
}) {
  const [sectionId, setSectionId] = useState<AppSection['id'] | undefined>(initialSection);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const section = APP_SECTIONS.find(s => s.id === sectionId);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
      {!section ? (
        <>
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
            <p className="font-semibold">¡Hola! Soy EcoCoach y te acompaño en Ecoland.</p>
            <p className="mt-1">La app tiene 4 secciones. ¿Qué quieres hacer?</p>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {APP_SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSectionId(s.id)}
                    className="flex h-full w-full flex-col items-start gap-1 rounded-2xl border bg-white p-3 text-left hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.accent}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="font-semibold text-slate-900">{s.label}</span>
                    <span className="text-xs text-slate-600">{s.question}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
            <p className="font-semibold">{section.label}: {section.question.toLowerCase()}</p>
            <p className="mt-1">{section.tagline}</p>
            <ol className="mt-2 list-decimal pl-5 space-y-0.5">
              {section.steps.map(step => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toca una función para ver cómo se usa</p>
          <ul className="space-y-2">
            {section.items.map(item => {
              const Icon = item.icon;
              const open = openItem === item.to;
              return (
                <li key={item.to} className="rounded-2xl border bg-white">
                  <button
                    onClick={() => setOpenItem(open ? null : item.to)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-2xl"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span className="flex-1 font-semibold text-slate-900">{item.label}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {open && (
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-slate-700">{item.howTo}</p>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
                      >
                        Ir a {item.label.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            {APP_SECTIONS.filter(s => s.id !== section.id).map(s => (
              <button key={s.id} onClick={() => { setSectionId(s.id); setOpenItem(null); }}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
                Explícame {s.label}
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={onChat} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 font-semibold text-emerald-900 hover:bg-emerald-100">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Pregúntale algo a EcoCoach
      </button>
    </div>
  );
}
