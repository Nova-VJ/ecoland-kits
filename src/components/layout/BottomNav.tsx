import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { APP_SECTIONS, sectionForPath } from '@/data/appSections';

export const BottomNav = () => {
  const location = useLocation();
  const activeSection = sectionForPath(location.pathname, location.search);

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home, active: location.pathname === '/' },
    ...APP_SECTIONS.map(s => ({ to: s.path, label: s.label, icon: s.icon, active: activeSection?.id === s.id })),
  ];

  return (
    <nav aria-label="Navegación principal" className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                isActive ? 'text-emerald-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`px-3.5 py-1 rounded-full transition-colors ${isActive ? 'bg-emerald-100 text-emerald-900' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}


      </div>
    </nav>
  );
};

export default BottomNav;
