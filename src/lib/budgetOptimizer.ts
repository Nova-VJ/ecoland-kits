import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';

export interface BudgetConfig {
  budgetAmount: number; // e.g. 50
  persons: number; // 1, 2, 4
  days: number; // 3, 5, 7
  diet: 'todas' | 'vegano' | 'sin-gluten' | 'proteina';
}

export interface GeneratedBasketItem {
  product: CatalogProduct;
  categoryRole: 'desayuno' | 'legumbre' | 'cereal' | 'verdura' | 'grasa_esencial' | 'superalimento';
  quantity: number;
  subtotal: number;
}

export interface BudgetBasketResult {
  items: GeneratedBasketItem[];
  totalCost: number;
  estimatedMeals: number;
  totalCalories: number;
  totalProtein: number;
  totalFiber: number;
  bioPercentage: number;
}

export function generateSmartBudgetBasket(config: BudgetConfig): BudgetBasketResult {
  const { budgetAmount, persons, days, diet } = config;
  
  // Filter products by diet
  let available = allCatalogProducts.filter(p => p.price > 0 && p.inStock);
  
  if (diet === 'vegano') {
    available = available.filter(p => p.tags.includes('vegano'));
  } else if (diet === 'sin-gluten') {
    available = available.filter(p => p.tags.includes('sin-gluten'));
  } else if (diet === 'proteina') {
    available = available.filter(p => p.tags.includes('proteina') || p.category === 'legumbres' || p.category === 'proteina');
  }

  // Categorize available products
  const desayunos = available.filter(p => p.category === 'desayunos' || p.slug.includes('avena') || p.slug.includes('muesli') || p.slug.includes('copos'));
  const legumbres = available.filter(p => p.category === 'legumbres' || p.slug.includes('garbanzo') || p.slug.includes('lenteja') || p.slug.includes('alubia') || p.slug.includes('tofu'));
  const cereales = available.filter(p => p.category === 'cereales' || p.category === 'pastas' || p.slug.includes('arroz') || p.slug.includes('quinoa') || p.slug.includes('macarron'));
  const verduras = available.filter(p => p.category === 'conservas' || p.category === 'sopas' || p.slug.includes('verdura') || p.slug.includes('esparrago') || p.slug.includes('gazpacho') || p.slug.includes('tomate'));
  const aceites = available.filter(p => p.category === 'aceites' || p.slug.includes('aceite') || p.slug.includes('aove'));
  const superfoods = available.filter(p => p.category === 'superalimentos' || p.slug.includes('matcha') || p.slug.includes('acai') || p.slug.includes('chia') || p.slug.includes('lino'));

  const selectedItems: GeneratedBasketItem[] = [];
  let currentCost = 0;

  // Helper to safely pick items up to budget
  const tryAdd = (pool: CatalogProduct[], role: GeneratedBasketItem['categoryRole'], maxQty = 1) => {
    if (pool.length === 0) return;
    // Sort pool by price to ensure good budget fit
    const sorted = [...pool].sort((a, b) => a.price - b.price);
    
    // Pick an item that isn't already in selectedItems and fits currentCost
    for (const prod of sorted) {
      if (selectedItems.some(x => x.product.slug === prod.slug)) continue;
      if (currentCost + prod.price <= budgetAmount * 1.05) {
        selectedItems.push({
          product: prod,
          categoryRole: role,
          quantity: maxQty,
          subtotal: prod.price * maxQty
        });
        currentCost += prod.price * maxQty;
        return;
      }
    }
  };

  // Determine how many items we need based on days & budget
  // 1. Always include a wholesome breakfast staple
  tryAdd(desayunos, 'desayuno');
  if (persons > 1 || days >= 5) {
    tryAdd(desayunos, 'desayuno');
  }

  // 2. Add 2 to 4 legume / protein staples
  tryAdd(legumbres, 'legumbre');
  tryAdd(legumbres, 'legumbre');
  if (budgetAmount >= 45 || persons >= 2) {
    tryAdd(legumbres, 'legumbre');
  }

  // 3. Add 2 to 3 whole grains / pseudocereals
  tryAdd(cereales, 'cereal');
  tryAdd(cereales, 'cereal');
  if (days >= 5) {
    tryAdd(cereales, 'cereal');
  }

  // 4. Add 2 to 4 vegetable / vegetable soup staples
  tryAdd(verduras, 'verdura');
  tryAdd(verduras, 'verdura');
  if (budgetAmount >= 50) {
    tryAdd(verduras, 'verdura');
  }

  // 5. Add healthy oil or essential fat
  tryAdd(aceites, 'grasa_esencial');

  // 6. If budget still has room, add superfoods or additional snacks
  if (budgetAmount - currentCost >= 8) {
    tryAdd(superfoods, 'superalimento');
  }
  if (budgetAmount - currentCost >= 4) {
    tryAdd(legumbres, 'legumbre');
  }
  if (budgetAmount - currentCost >= 3) {
    tryAdd(cereales, 'cereal');
  }
  if (budgetAmount - currentCost >= 3) {
    tryAdd(verduras, 'verdura');
  }

  // Ensure fallback if empty
  if (selectedItems.length === 0) {
    available.slice(0, 6).forEach(p => {
      selectedItems.push({
        product: p,
        categoryRole: 'legumbre',
        quantity: 1,
        subtotal: p.price
      });
      currentCost += p.price;
    });
  }

  const estimatedMeals = persons * days * 2; // Lunch and dinner
  const totalCalories = Math.round(selectedItems.length * 950);
  const totalProtein = Math.round(selectedItems.length * 48);
  const totalFiber = Math.round(selectedItems.length * 36);

  return {
    items: selectedItems,
    totalCost: Math.round(currentCost * 100) / 100,
    estimatedMeals,
    totalCalories,
    totalProtein,
    totalFiber,
    bioPercentage: 100
  };
}
