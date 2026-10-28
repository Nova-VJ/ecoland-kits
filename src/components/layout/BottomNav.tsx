import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Sparkles, BookOpen, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const location = useLocation();
  const { totalItems, setIsOpen } = useCart();

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/tienda', label: 'Tienda', icon: Store },
    { to: '/ecohealth', label: 'EcoHealth', icon: Sparkles },
    { to: '/blog', label: 'Recetas', icon: BookOpen },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-2xl transition-all ${
                isActive ? 'text-emerald-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-100 text-emerald-900' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Botón Carrito con apertura directa del drawer */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[46px] text-slate-500 hover:text-slate-800 relative rounded-2xl"
          title="Ver cesta"
        >
          <div className="p-1 rounded-xl relative">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-800 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs"
              >
                {totalItems}
              </motion.span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-slate-600">
            Cesta
          </span>
        </button>

      </div>
    </nav>
  );
};

export default BottomNav;
