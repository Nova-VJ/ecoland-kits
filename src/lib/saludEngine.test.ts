import { describe, it, expect } from 'vitest';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { getProductFacts } from '@/data/catalog/productFacts';
import { evaluateProduct, recommendProducts, reviewCart, foodTypesOf } from './saludEngine';

const find = (text: string) => {
  const p = allCatalogProducts.find(x => x.name.toUpperCase().includes(text.toUpperCase()));
  if (!p) throw new Error(`Producto de prueba no encontrado: ${text}`);
  return p;
};

describe('Ecoland Salud — motor de compatibilidad', () => {
  it('un chorizo nunca es compatible con una alimentación vegana', () => {
    const chorizo = find('CHORIZO EMBUTIDO');
    expect(evaluateProduct(chorizo, { needs: ['vegano'], avoidAllergens: [] }).status).toBe('conflicto');
  });

  it('para alergias nunca da un producto por seguro: como mucho pide revisar el envase', () => {
    const garbanzos = allCatalogProducts.filter(p => /GARBANZO/i.test(p.name));
    for (const p of garbanzos) {
      const r = evaluateProduct(p, { needs: [], avoidAllergens: ['cacahuete'] });
      expect(r.status).not.toBe('compatible');
    }
  });

  it('marca como conflicto un alérgeno que el producto contiene', () => {
    const tahin = find('TAHIN');
    expect(evaluateProduct(tahin, { needs: [], avoidAllergens: ['sesamo'] }).status).toBe('conflicto');
  });

  it('celiaquía: solo lo declarado sin gluten es compatible; la avena sin declarar no', () => {
    const avenaSinGluten = find('COPOS DE AVENA SIN GLUTEN');
    expect(evaluateProduct(avenaSinGluten, { needs: ['celiaquia'], avoidAllergens: [] }).status).toBe('compatible');
    const avena = allCatalogProducts.find(p => /COPOS DE AVENA/i.test(p.name) && !/SIN GLUTEN/i.test(p.name))!;
    expect(evaluateProduct(avena, { needs: ['celiaquia'], avoidAllergens: [] }).status).not.toBe('compatible');
    const espelta = find('HARINA DE ESPELTA');
    expect(evaluateProduct(espelta, { needs: ['celiaquia'], avoidAllergens: [] }).status).toBe('conflicto');
  });

  it('el miso de cebada ya no aparece como apto para celíacos', () => {
    const miso = find('BARLEY');
    expect(getProductFacts(miso.id).sinGluten).toBe(false);
    expect(miso.tags).not.toContain('sin-gluten');
  });

  it('ningún producto de origen animal queda etiquetado como vegano', () => {
    const animal = /\b(CHORIZO|POLLO|ANCHOA|SARDINA|BONITO|COLAGENO|MIEL|HUEVO|YOGUR NATURAL|LECHE ENTERA)\b/i;
    const wrong = allCatalogProducts.filter(p => animal.test(p.name) && p.tags.includes('vegano'));
    expect(wrong.map(p => p.name)).toEqual([]);
  });

  it('las recomendaciones nunca incluyen conflictos ni productos que no son alimentos', () => {
    const recs = recommendProducts(allCatalogProducts, { needs: ['vegano', 'azucar'], avoidAllergens: ['frutos-cascara'] }, 50);
    expect(recs.length).toBeGreaterThan(0);
    for (const { product, match } of recs) {
      expect(match.status).not.toBe('conflicto');
      expect(getProductFacts(product.id).kind).toBe('alimento');
    }
  });

  it('la revisión de la cesta señala la leche si se evita la lactosa', () => {
    const leche = find('LECHE ENTERA DE VACA');
    const lentejas = allCatalogProducts.find(p => /LENTEJA/i.test(p.name))!;
    const conflicts = reviewCart([leche, lentejas], { needs: ['lactosa'], avoidAllergens: [] });
    expect(conflicts.map(c => c.product.id)).toEqual([leche.id]);
  });

  it('reconoce los tipos de alimento sin confundir un dulce integral con un cereal integral', () => {
    expect(foodTypesOf(find('LENTEJA'))).toContain('legumbre');
    const galletas = allCatalogProducts.find(p => /GALLETA.*INTEGRAL|INTEGRAL.*GALLETA/i.test(p.name));
    if (galletas) expect(foodTypesOf(galletas)).not.toContain('cereal-integral');
  });
});
