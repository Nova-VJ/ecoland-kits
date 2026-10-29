import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { APP_SECTIONS } from '@/data/appSections';

// Las 4 puertas de Ecoland: el punto de partida para que cada cliente vaya directo a lo que necesita.
export const SectionDoors = () => (
  <section aria-labelledby="puertas-titulo" className="py-10 md:py-14">
    <div className="container-eco space-y-6">
      <div className="text-center space-y-2">
        <h2 id="puertas-titulo" className="font-display text-2xl md:text-3xl font-bold text-slate-900">¿Qué quieres hacer hoy?</h2>
        <p className="text-slate-600">Elige por dónde empezar. EcoCoach te acompaña en cada paso.</p>
      </div>
      <ul className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {APP_SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <Link
                to={section.path}
                className="group flex h-full flex-col gap-3 rounded-3xl border bg-white p-4 sm:p-6 transition-all hover:border-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${section.accent}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-800">{section.question}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-display text-xl font-bold text-slate-900">
                    {section.label}
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
                <span className="hidden sm:block text-sm text-slate-600">{section.tagline}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);
