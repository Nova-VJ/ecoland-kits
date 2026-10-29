import {
  Zap, Leaf, Dumbbell, WheatOff, Sprout, Briefcase, Baby, Sparkles, SprayCan, Gift, Coffee, Fish,
  Cookie, Droplet, Pill, Croissant, Bean, Nut, Soup, Package, Candy, ShieldCheck, Utensils,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Un icono sobrio por categoría o filtro, en lugar de emojis sueltos
const ICONS: Record<string, LucideIcon> = {
  // Objetivos de packs
  energia: Zap,
  digestion: Leaf,
  proteina: Dumbbell,
  'sin-gluten': WheatOff,
  vegano: Sprout,
  oficina: Briefcase,
  kids: Baby,
  limpieza: SprayCan,
  higiene: Droplet,
  regalo: Gift,
  // Categorías de packs
  detox: Leaf,
  asiatica: Soup,
  mar: Fish,
  cafe: Coffee,
  inmunidad: Pill,
  cosmetica: Sparkles,
  snacks: Cookie,
  aceites: Droplet,
  accesorios: Package,
  // Categorías del catálogo
  desayunos: Croissant,
  superfoods: Sprout,
  legumbres: Bean,
  salsas: Soup,
  endulzantes: Candy,
  bebidas: Coffee,
  panaderia: Croissant,
  'conservas-mar': Fish,
  granel: Nut,
  // Filtros de dieta
  'sin-azucar': Candy,
  bio: ShieldCheck,
};

export const CategoryIcon = ({ id, className }: { id: string; className?: string }) => {
  const Icon = ICONS[id] ?? Utensils;
  return <Icon className={cn('w-4 h-4 shrink-0', className)} aria-hidden />;
};
