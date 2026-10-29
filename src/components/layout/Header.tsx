import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, MapPin, Heart, Search } from 'lucide-react';
import { APP_SECTIONS, sectionForPath } from '@/data/appSections';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import logoEcoland from '@/assets/logo-ecoland-2.jpg';
import { QuickSearchModal } from '@/components/layout/QuickSearchModal';

const moreLinks = [
  { to: '/cuenta', label: 'Mi Ecoland', icon: User },
  { to: '/donde-estamos', label: 'Dónde estamos', icon: MapPin },
  { to: '/importancia-y-mision', label: 'Misión', icon: Heart },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsOpen } = useCart();
  const activeSection = sectionForPath(location.pathname, location.search);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container-eco flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoEcoland} 
              alt="Ecoland" 
              className="h-10 md:h-12 w-auto rounded-lg object-contain transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {APP_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection?.id === section.id;
              return (
                <Link
                  key={section.id}
                  to={section.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} aria-hidden="true" />
                  {section.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, User, Cart, Mobile Menu */}
          <div className="flex items-center gap-1.5 md:gap-2">
            
            {/* Buscador Rápido Omnipresente */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl"
              title="Buscar productos (avena, legumbres, quinoa...)"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Usuario / Cuenta */}
            <Link to="/cuenta">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl"
                title="Mi Ecoland (mi cuenta)"
                aria-label="Mi Ecoland"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Carrito con Contador Dinámico */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl"
              title="Ver cesta de la compra"
              aria-label={totalItems > 0 ? `Ver cesta (${totalItems} productos)` : 'Ver cesta'}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-700 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-xs"
                >
                  {totalItems}
                </motion.span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden text-slate-700 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t bg-background/98 backdrop-blur-lg px-4 py-4 space-y-1 shadow-lg"
            >
              {APP_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection?.id === section.id;
                return (
                  <div key={section.id} className="pb-2">
                    <Link
                      to={section.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive ? 'bg-emerald-900 text-white' : 'text-slate-900 hover:bg-muted'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} aria-hidden="true" />
                      {section.label}
                      <span className={`ml-auto text-xs font-medium ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>{section.question}</span>
                    </Link>
                    <div className="flex flex-wrap gap-1.5 pl-11 pt-1">
                      {section.items.slice(0, 4).map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-2 flex flex-wrap gap-1">
                {moreLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">
                      <Icon className="w-4 h-4 text-emerald-700" aria-hidden="true" />{link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modal de Búsqueda Rápida Omnipresente */}
      <QuickSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Header;
