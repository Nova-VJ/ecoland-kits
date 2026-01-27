// Categorías del catálogo Ecoland
export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const catalogCategories: Category[] = [
  { id: 'desayunos', label: 'Desayunos, Cereales & Granolas', icon: '🥣', description: 'Mueslis, copos, granolas y cereales ecológicos' },
  { id: 'superfoods', label: 'Superfoods & Suplementos', icon: '🌿', description: 'Espirulina, matcha, proteínas vegetales' },
  { id: 'legumbres', label: 'Legumbres & Conservas', icon: '🥫', description: 'Legumbres, verduras y platos preparados' },
  { id: 'salsas', label: 'Salsas & Fermentados', icon: '🍶', description: 'Tamari, miso, chucrut, patés vegetales' },
  { id: 'endulzantes', label: 'Endulzantes & Siropes', icon: '🍯', description: 'Siropes naturales, azúcar de coco, eritritol' },
  { id: 'bebidas', label: 'Café, Cacao & Bebidas', icon: '☕', description: 'Cafés ecológicos, infusiones, leches vegetales' },
  { id: 'aceites', label: 'Aceites & Vinagres', icon: '🫒', description: 'Aceites de primera prensión y vinagres bio' },
  { id: 'panaderia', label: 'Panadería & Galletas', icon: '🥖', description: 'Panes, tortitas, biscotes y galletas' },
  { id: 'conservas-mar', label: 'Conservas del Mar', icon: '🐟', description: 'Atún, sardinas, caballa ecológicos' },
  { id: 'cosmetica', label: 'Cosmética Natural & CBD', icon: '🧴', description: 'Cuidado facial, corporal y CBD' },
  { id: 'granel', label: 'Productos a Granel', icon: '🥜', description: 'Frutos secos, algas, especias' },
];
