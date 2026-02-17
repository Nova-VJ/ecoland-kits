import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Package, Store, ClipboardList, Repeat, BookOpen, Crown, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import logoEcoland from '@/assets/logo-ecoland-2.jpg';
const navLinks = [{
  to: '/packs',
  label: 'Packs',
  icon: Package
}, {
  to: '/tienda',
  label: 'Tienda',
  icon: Store
}, {
  to: '/quiz',
  label: 'Test',
  icon: ClipboardList
}, {
  to: '/suscripcion',
  label: 'Suscripción',
  icon: Repeat
}, {
  to: '/blog',
  label: 'Recetas',
  icon: BookOpen
}, {
  to: '/club',
  label: 'Club',
  icon: Crown
}, {
  to: '/donde-estamos',
  label: 'Dónde estamos',
  icon: MapPin
}, {
  to: '/importancia-y-mision',
  label: 'Misión',
  icon: Heart
}];
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {
    totalItems,
    setIsOpen
  } = useCart();
  return <>
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container-eco">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img alt="Ecoland" className="h-10 md:h-12 w-auto rounded-lg" src={logoEcoland} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => <Link key={link.to} to={link.to} className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.to ? 'text-primary' : 'text-foreground/70'}`}>
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>}
            </Button>
            <Link to="/cuenta">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu - outside header to avoid glass transparency */}
    <AnimatePresence>
      {isMenuOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-foreground/20 z-50 lg:hidden" onClick={() => setIsMenuOpen(false)} />
          <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed top-0 right-0 bottom-0 w-80 z-50 lg:hidden shadow-xl border-l border-border" style={{ backgroundColor: 'hsl(var(--card))' }}>
            <div className="p-4 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="px-6 py-4 space-y-4">
              {navLinks.map(link => <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className={`block text-lg font-medium py-2 transition-colors ${location.pathname === link.to ? 'text-primary' : 'text-foreground/70'}`}>
                  {link.label}
                </Link>)}
              <div className="pt-4 border-t">
                <Link to="/cuenta" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium py-2">
                  <User className="h-5 w-5" />
                  Mi cuenta
                </Link>
              </div>
            </nav>
          </motion.div>
        </>}
    </AnimatePresence>
  </>;
};