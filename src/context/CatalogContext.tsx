import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';

interface CatalogContextType {
  products: CatalogProduct[];
  isLiveSync: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  refreshCatalog: () => Promise<void>;
  getProductBySlug: (slug: string) => CatalogProduct | undefined;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Helper to slugify
function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

// Helper to assign categories dynamically
function assignCategory(name: string, brand: string): string {
  const t = (name + ' ' + brand).toLowerCase();
  if (t.includes('agar') || t.includes('alga')) return 'granel';
  if (t.includes('aceite') || t.includes('aove') || t.includes('vinagre')) return 'aceites';
  if (t.includes('lenteja') || t.includes('garbanzo') || t.includes('alubia') || t.includes('judia') || t.includes('crema de')) return 'legumbres';
  if (t.includes('muesli') || t.includes('granola') || t.includes('copos') || t.includes('avena') || t.includes('salvado') || t.includes('porridge')) return 'desayunos';
  if (t.includes('proteina') || t.includes('protein') || t.includes('matcha') || t.includes('acai') || t.includes('spirulina') || t.includes('chlorella') || t.includes('maca') || t.includes('guarana') || t.includes('colageno')) return 'superfoods';
  if (t.includes('tamari') || t.includes('shoyu') || t.includes('miso') || t.includes('mostaza') || t.includes('chucrut') || t.includes('pate')) return 'salsas';
  if (t.includes('sirope') || t.includes('azucar') || t.includes('eritritol') || t.includes('miel')) return 'endulzantes';
  if (t.includes('cafe') || t.includes('café') || t.includes('te') || t.includes('té') || t.includes('infusion') || t.includes('cerveza') || t.includes('vino') || t.includes('caldo')) return 'bebidas';
  if (t.includes('pan') || t.includes('tortitas') || t.includes('galletas') || t.includes('harina')) return 'panaderia';
  if (t.includes('atun') || t.includes('atún') || t.includes('bonito') || t.includes('sardina') || t.includes('caballa')) return 'conservas-mar';
  if (t.includes('crema facial') || t.includes('champu') || t.includes('jabon') || t.includes('gel') || t.includes('alga maris') || t.includes('drasanvi bronze')) return 'cosmetica';
  return 'granel';
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<CatalogProduct[]>(allCatalogProducts);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const refreshCatalog = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('https://ecoland-inventario.valetdemo.workers.dev/api/state', {
        headers: { 'Cache-Control': 'no-store' }
      });
      if (!res.ok) throw new Error('Error al conectar con el inventario de Cloudflare');
      
      const state = await res.json();
      const erpConf = (state.erp || []).filter((p: any) => p.estado === 'confirmado');
      const nuevosAct = (state.nuevos || []).filter((n: any) => n.estado !== 'fantasma');

      const liveList: CatalogProduct[] = [];
      const slugCounts: Record<string, number> = {};

      // Match each live item with our rich description dictionary, or create a live entry
      const existingMap = new Map<string, CatalogProduct>();
      allCatalogProducts.forEach(p => existingMap.set(p.id, p));

      // 1. Process ERP
      erpConf.forEach((p: any) => {
        const id = `erp-${p.codigo}`;
        const existing = existingMap.get(id);
        
        let imgUrl = existing?.image || '';
        if (p.foto) {
          imgUrl = p.foto.startsWith('http') 
            ? p.foto 
            : `https://ecoland-inventario.valetdemo.workers.dev/fotos/m/${p.foto.replace(/\.(jpg|jpeg|png|webp)$/i, '')}.jpg`;
        }

        const brand = p.subfamilia || p.marca || existing?.brand || 'Ecoland';
        const rawName = p.nombre || existing?.name || '';
        const price = Number(p.pvp || existing?.price || 0);

        if (existing) {
          liveList.push({
            ...existing,
            price,
            image: imgUrl || existing.image,
            inStock: true
          });
        } else {
          // New dynamic product from ERP
          const baseSlug = slugify(`${brand} ${rawName}`);
          slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
          const slug = slugCounts[baseSlug] > 1 ? `${baseSlug}-${slugCounts[baseSlug]}` : baseSlug;

          liveList.push({
            id,
            slug,
            name: `${brand} – ${rawName}`,
            brand,
            description: `${rawName} de ${brand} es un producto ecológico certificado por la Unión Europea (Euro-hoja), cultivado y seleccionado bajo rigurosos estándares de sostenibilidad.`,
            price,
            weight: p.formato || 'Estándar',
            image: imgUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
            category: assignCategory(rawName, brand),
            tags: ['bio', 'premium', 'vegano'],
            allergens: ['Consultar etiquetado oficial'],
            ingredients: 'Ingredientes procedentes de agricultura ecológica certificada (100% bio).',
            usage: '✔ Ideal para el consumo diario dentro de una alimentación consciente y equilibrada.\n✔ Conservar en lugar fresco, seco y al abrigo de la luz.',
            inStock: true
          });
        }
      });

      // 2. Process Nuevos
      nuevosAct.forEach((n: any) => {
        const id = `nuevo-${n.id}`;
        const existing = existingMap.get(id);

        let imgUrl = existing?.image || '';
        if (n.foto) {
          imgUrl = n.foto.startsWith('http')
            ? n.foto
            : `https://ecoland-inventario.valetdemo.workers.dev/fotos/m/${n.foto.replace(/\.(jpg|jpeg|png|webp)$/i, '')}.jpg`;
        }

        const brand = n.marca || existing?.brand || 'Ecoland';
        const rawName = n.clean || existing?.name || '';
        const price = Number(n.precio_foto || n.price || existing?.price || 0);

        if (existing) {
          liveList.push({
            ...existing,
            price,
            image: imgUrl || existing.image,
            inStock: true
          });
        } else {
          const baseSlug = slugify(`${brand} ${rawName}`);
          slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
          const slug = slugCounts[baseSlug] > 1 ? `${baseSlug}-${slugCounts[baseSlug]}` : baseSlug;

          liveList.push({
            id,
            slug,
            name: `${brand} – ${rawName}`,
            brand,
            description: `${rawName} de ${brand} es un producto físico ecológico seleccionado directamente de la tienda Ecoland, con certificación oficial y garantía de calidad.`,
            price,
            weight: n.formato || 'Estándar',
            image: imgUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
            category: assignCategory(rawName, brand),
            tags: ['bio', 'premium', 'vegano'],
            allergens: ['Consultar etiquetado oficial'],
            ingredients: 'Ingredientes 100% de agricultura biológica.',
            usage: '✔ Uso habitual en recetas caseras y nutrición diaria.\n✔ Conservar en lugar fresco y seco.',
            inStock: true
          });
        }
      });

      setProducts(liveList);
      setIsLiveSync(true);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('No se pudo sincronizar en vivo con Cloudflare, usando catálogo base precompilado:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch live state on mount
  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const getProductBySlug = useCallback((slug: string) => {
    return products.find(p => p.slug === slug);
  }, [products]);

  return (
    <CatalogContext.Provider value={{
      products,
      isLiveSync,
      isSyncing,
      lastSyncedAt,
      refreshCatalog,
      getProductBySlug
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog debe usarse dentro de un CatalogProvider');
  }
  return context;
};
