import { allCatalogProducts, CatalogProduct } from '../src/data/catalog/individual-products';
import rawFacts from '../src/data/catalog/product-facts.json';
import * as fs from 'fs';
import * as path from 'path';

type ProductKind = 'alimento' | 'bebida-alcoholica' | 'suplemento' | 'cosmetica' | 'hogar';
type AllergenId = 'gluten' | 'crustaceos' | 'huevo' | 'pescado' | 'cacahuete' | 'soja' | 'leche' | 'frutos-cascara' | 'apio' | 'mostaza' | 'sesamo' | 'sulfitos' | 'altramuz' | 'moluscos';

interface ProductFacts {
  kind: ProductKind;
  vegano: boolean | null;
  vegetariano: boolean | null;
  veganoFuente: 'declarado' | 'inferido' | 'desconocido';
  sinGluten: boolean | null;
  glutenFuente: 'declarado' | 'inferido' | 'naturalmente-sin-gluten' | 'desconocido';
  sinLactosa: boolean | null;
  alergenos: AllergenId[];
  formatos?: string[];
}

const facts = { ...(rawFacts as Record<string, ProductFacts>) };

let newlyResolved = 0;

for (const p of allCatalogProducts) {
  const current = facts[p.id];
  if (!current || current.veganoFuente === 'desconocido') {
    const nameLower = (p.name + ' ' + (p.description || '')).toLowerCase();
    const tags = p.tags || [];
    const allergensText = (p.allergens || []).join(' ').toLowerCase();

    const kind: ProductKind = current?.kind || (
      p.category === 'cosmetica' ? 'cosmetica' :
      p.category === 'hogar' ? 'hogar' :
      nameLower.includes('vino') || nameLower.includes('cerveza') ? 'bebida-alcoholica' :
      nameLower.includes('colágeno') || nameLower.includes('vitamina') || nameLower.includes('suplemento') ? 'suplemento' :
      'alimento'
    );

    // 1. Alérgenos UE
    const alergenos: AllergenId[] = [];
    if (nameLower.includes('trigo') || nameLower.includes('espelta') || nameLower.includes('cebada') || nameLower.includes('centeno') || nameLower.includes('cuscús') || nameLower.includes('cous cous') || (nameLower.includes('avena') && !tags.includes('sin-gluten'))) {
      alergenos.push('gluten');
    }
    if (nameLower.includes('soja') || nameLower.includes('tofu') || nameLower.includes('tempeh')) alergenos.push('soja');
    if (nameLower.includes('almendra') || nameLower.includes('nuez') || nameLower.includes('avellana') || nameLower.includes('anacardo') || nameLower.includes('pistacho')) alergenos.push('frutos-cascara');
    if (nameLower.includes('sésamo') || nameLower.includes('sesamo') || nameLower.includes('tahini')) alergenos.push('sesamo');
    if (nameLower.includes('sulfitos') || nameLower.includes('vinagre') || nameLower.includes('vino')) alergenos.push('sulfitos');
    if (nameLower.includes('bonito') || nameLower.includes('atún') || nameLower.includes('caballa') || nameLower.includes('pescado')) alergenos.push('pescado');
    if (nameLower.includes('huevo') || nameLower.includes('mayonesa')) alergenos.push('huevo');
    if (nameLower.includes('leche') || nameLower.includes('queso') || nameLower.includes('yogur') || nameLower.includes('kéfir') || nameLower.includes('mantequilla')) alergenos.push('leche');
    if (nameLower.includes('cacahuete')) alergenos.push('cacahuete');
    if (nameLower.includes('mostaza')) alergenos.push('mostaza');
    if (nameLower.includes('apio')) alergenos.push('apio');

    // 2. Sin gluten
    let sinGluten: boolean | null = null;
    let glutenFuente: 'declarado' | 'inferido' | 'naturalmente-sin-gluten' | 'desconocido' = 'desconocido';

    if (tags.includes('sin-gluten') || allergensText.includes('sin gluten') || nameLower.includes('sin gluten')) {
      sinGluten = true;
      glutenFuente = 'declarado';
    } else if (alergenos.includes('gluten')) {
      sinGluten = false;
      glutenFuente = 'inferido';
    } else if (nameLower.includes('arroz') || nameLower.includes('quinoa') || nameLower.includes('lenteja') || nameLower.includes('garbanzo') || nameLower.includes('alubia') || nameLower.includes('aceite') || nameLower.includes('semilla')) {
      sinGluten = null; // Puede haber trazas salvo que declare sin gluten
      glutenFuente = 'naturalmente-sin-gluten';
    }

    // 3. Vegano & Vegetariano
    let vegano: boolean | null = null;
    let vegetariano: boolean | null = null;
    let veganoFuente: 'declarado' | 'inferido' | 'desconocido' = 'desconocido';

    if (alergenos.includes('pescado')) {
      vegano = false;
      vegetariano = false;
      veganoFuente = 'inferido';
    } else if (alergenos.includes('huevo') || alergenos.includes('leche') || nameLower.includes('miel') || nameLower.includes('propóleo') || nameLower.includes('jalea real')) {
      vegano = false;
      vegetariano = true;
      veganoFuente = 'inferido';
    } else if (tags.includes('vegano')) {
      vegano = true;
      vegetariano = true;
      veganoFuente = 'declarado';
    } else if (kind === 'alimento' || kind === 'cosmetica') {
      vegano = true;
      vegetariano = true;
      veganoFuente = 'inferido';
    }

    // 4. Sin lactosa
    const sinLactosa = alergenos.includes('leche') ? false : true;

    facts[p.id] = {
      kind,
      vegano,
      vegetariano,
      veganoFuente,
      sinGluten,
      glutenFuente,
      sinLactosa,
      alergenos,
      formatos: current?.formatos || [p.weight || 'Formato estándar']
    };
    newlyResolved++;
  }
}

console.log(`Newly resolved facts: ${newlyResolved}`);

// Write updated product-facts.json
const targetPath = path.resolve('src/data/catalog/product-facts.json');
fs.writeFileSync(targetPath, JSON.stringify(facts, null, 2), 'utf-8');
console.log(`Saved 100% of product facts to: ${targetPath}`);
