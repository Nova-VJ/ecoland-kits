import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { APP_SECTIONS, type AppSection } from '@/data/appSections';
import { RestockPanel } from '@/components/pantry/RestockReminders';
import { openCoachGuide } from '@/lib/coachGuide';

const SectionHub = ({ id }: { id: AppSection['id'] }) => {
  const section = APP_SECTIONS.find(s => s.id === id);
  if (!section) return <Navigate to="/" replace />;
  const Icon = section.icon;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      <div className="container-eco py-8 md:py-12 space-y-8">
        {/* Cabecera: qué es esta sección y para qué sirve */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${section.accent}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">{section.question}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900">{section.label}</h1>
            </div>
          </div>
          <p className="text-base md:text-lg text-slate-700 max-w-2xl">{section.tagline}</p>

          {/* Recorrido en 3 pasos */}
          <ol className="grid gap-2 sm:grid-cols-3">
            {section.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </header>

        {/* Funciones de la sección, en el orden en que se usan juntas */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map(item => {
            const ItemIcon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="group flex h-full items-start gap-4 rounded-2xl border bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <ItemIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">{item.desc}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {id === 'organizarme' && <RestockPanel />}

        <button
          type="button"
          onClick={() => openCoachGuide(section.id)}
          className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-950 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        >
          <MessageCircleQuestion className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <span><strong>¿Dudas sobre cómo funciona {section.label.toLowerCase()}?</strong> EcoCoach te lo explica paso a paso.</span>
        </button>
      </div>
    </div>
  );
};

export default SectionHub;
