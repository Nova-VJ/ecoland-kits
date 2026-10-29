import { allCatalogProducts } from '../src/data/catalog/individual-products';
import rawFacts from '../src/data/catalog/product-facts.json';

const facts = rawFacts as Record<string, any>;

const unresolvedProducts = allCatalogProducts.filter(p => facts[p.id]?.veganoFuente === 'desconocido');

console.log(`Unresolved products in allCatalogProducts: ${unresolvedProducts.length}`);

for (const p of unresolvedProducts.slice(0, 10)) {
  console.log(`\nID: ${p.id}`);
  console.log(`Name: ${p.name.slice(0, 70)}...`);
  console.log(`Tags: ${JSON.stringify(p.tags)}`);
  console.log(`Allergens: ${JSON.stringify(p.allergens)}`);
  console.log(`Ingredients: ${p.ingredients?.slice(0, 70)}...`);
}
