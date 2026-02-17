import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';
import { Link } from 'react-router-dom';

interface Props {
  type: 'product' | 'pack';
  slug: string;
}

export const EcoCoachProductCard = ({ type, slug }: Props) => {
  const { addCatalogProduct, addCatalogPack } = useCart();

  if (type === 'product') {
    const product = allCatalogProducts.find(p => p.slug === slug);
    if (!product) return <span className="text-xs text-muted-foreground italic">[Producto no encontrado]</span>;

    return (
      <span className="inline-flex items-center gap-1.5 bg-secondary/80 rounded-lg px-2 py-1 my-0.5">
        <Link to={`/tienda/producto/${product.slug}`} className="text-xs font-medium text-primary hover:underline">
          {product.name}
        </Link>
        <span className="text-[10px] text-muted-foreground">{product.price.toFixed(2)}€</span>
        <button
          onClick={(e) => { e.preventDefault(); addCatalogProduct(product); }}
          className="ml-0.5 p-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          title="Añadir al carrito"
        >
          <ShoppingCart className="h-3 w-3" />
        </button>
      </span>
    );
  }

  const pack = catalogPacks.find(p => p.slug === slug);
  if (!pack) return <span className="text-xs text-muted-foreground italic">[Pack no encontrado]</span>;

  return (
    <span className="inline-flex items-center gap-1.5 bg-secondary/80 rounded-lg px-2 py-1 my-0.5">
      <span className="text-sm">{pack.icon}</span>
      <Link to={`/tienda/pack/${pack.slug}`} className="text-xs font-medium text-primary hover:underline">
        {pack.name}
      </Link>
      <span className="text-[10px] text-muted-foreground">{pack.price.toFixed(2)}€</span>
      <button
        onClick={(e) => { e.preventDefault(); addCatalogPack(pack); }}
        className="ml-0.5 p-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        title="Añadir al carrito"
      >
        <ShoppingCart className="h-3 w-3" />
      </button>
    </span>
  );
};
