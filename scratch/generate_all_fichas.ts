import { allCatalogProducts, CatalogProduct } from '../src/data/catalog/individual-products';
import rawFacts from '../src/data/catalog/product-facts.json';
import * as fs from 'fs';
import * as path from 'path';

interface ProductFichaData {
  id: string;
  titulo: string;
  intro: string;
  secciones: { titulo: string; texto: string }[];
  versatilidad: { intro: string; usos: string[]; cierre: string };
  compromiso: string;
  categorias: string[];
  alergenos_texto: string;
  cierre: string;
}

const facts = rawFacts as Record<string, any>;
const fichasDir = path.resolve('public/fichas');

if (!fs.existsSync(fichasDir)) {
  fs.mkdirSync(fichasDir, { recursive: true });
}

let generatedCount = 0;
let existingCount = 0;

for (const p of allCatalogProducts) {
  const fichaPath = path.join(fichasDir, `${p.id}.json`);
  if (fs.existsSync(fichaPath)) {
    existingCount++;
    continue;
  }

  const pFacts = facts[p.id] || {};
  const cleanName = p.name.split('–')[0].trim().replace(/""/g, '').trim();
  const brand = p.brand && p.brand !== 'General / Multimarca' ? p.brand : 'Ecoland Selección';
  const weight = p.weight || 'Formato estándar';
  const category = p.category || 'despensa';

  // Parse existing description into sections if formatted with Markdown **
  const desc = p.description || '';
  const sections: { titulo: string; texto: string }[] = [];

  const splitBlocks = desc.split(/\*\*(.*?)\*\*/g);
  if (splitBlocks.length >= 3) {
    for (let i = 1; i < splitBlocks.length; i += 2) {
      const header = splitBlocks[i].trim();
      const body = (splitBlocks[i + 1] || '').trim().replace(/^[\s:\-\n]+/, '');
      if (header && body) {
        sections.push({
          titulo: header,
          texto: body.slice(0, 450)
        });
      }
    }
  }

  if (sections.length === 0) {
    sections.push({
      titulo: 'Origen biológico y pureza natural',
      texto: `${cleanName} de ${brand} se elabora exclusivamente a partir de ingredientes de agricultura ecológica certificada, sin pesticidas de síntesis química ni abonos artificiales.`
    });
    sections.push({
      titulo: 'Sabor auténtico y elaboración cuidada',
      texto: `Respetando los tiempos tradicionales y los procesos suaves de elaboración, conserva intactos todos sus matices organolépticos y textura natural.`
    });
    sections.push({
      titulo: 'Nutrición consciente para el hogar',
      texto: `Aporta nutrientes esenciales en su forma más limpia, ideal para una alimentación equilibrada inspirada en la dieta mediterránea y el plato saludable.`
    });
  }

  // Parse usage bullets
  const usageText = p.usage || '';
  const usageLines = usageText
    .split('\n')
    .filter(l => l.includes('✔') || l.includes('•') || l.includes('-'))
    .map(l => l.replace(/^[✔•\-\s*]+/, '').trim())
    .filter(Boolean);

  const finalUsos = usageLines.length >= 3 ? usageLines.slice(0, 5) : [
    `Consumo diario: Ideal para disfrutar directamente en desayunos, meriendas o platos principales.`,
    `Alternativa saludable: Sustituye a versiones procesadas convencionales con un perfil 100% ecológico.`,
    `Aliños y fondos: Base perfecta para dar cuerpo, sabor y textura a tus recetas de diario.`,
    `Cocina tradicional: Añade a guisos, salteados o verduras al vapor para enriquecer su valor nutritivo.`,
    `Repostería y cocina creativa: Aporta textura y matices naturales en elaboraciones caseras.`
  ];

  // Allergens text
  const allergensArray = p.allergens || [];
  let alergenosTexto = '';
  if (pFacts.alergenos && pFacts.alergenos.length > 0) {
    const list = pFacts.alergenos.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    alergenosTexto = `Contiene: ${list}. ${allergensArray[0] || 'Consulta siempre el etiquetado del envase antes de consumir.'}`;
  } else if (pFacts.sinGluten) {
    alergenosTexto = `Declarado sin gluten por el fabricante. Consulta siempre el envase para verificar alérgenos y posibles trazas.`;
  } else {
    alergenosTexto = allergensArray[0] || 'Consulta siempre la lista de alérgenos e ingredientes en el etiquetado del envase.';
  }

  // Categories
  const catSet = new Set<string>();
  catSet.add('Alimentación Ecológica');
  catSet.add(category.charAt(0).toUpperCase() + category.slice(1));
  if (pFacts.vegano) catSet.add('Apto para Veganos');
  if (pFacts.sinGluten) catSet.add('Sin Gluten');
  if (brand !== 'Ecoland Selección') catSet.add(brand);
  catSet.add(weight);

  const introParagraph = splitBlocks[0]?.trim() || 
    `${cleanName} de ${brand} (${weight}) es una propuesta ecológica de máxima pureza, seleccionada para quienes buscan disfrutar del auténtico sabor de la tierra sin aditivos artificiales. Un básico indispensable en la despensa saludable de cualquier hogar.`;

  const ficha: ProductFichaData = {
    id: p.id,
    titulo: `${brand} – ${cleanName} ${weight} – Especialidad Ecológica Certificada – 100% Bio`,
    intro: introParagraph.slice(0, 500),
    secciones: sections.slice(0, 4),
    versatilidad: {
      intro: `Una opción versátil y natural para enriquecer tu cocina de cada día:`,
      usos: finalUsos,
      cierre: `El formato de ${weight} garantiza una óptima conservación y la mejor relación calidad-precio para tu despensa.`
    },
    compromiso: `${brand} y Ecoland comparten el compromiso irrenunciable con la agricultura regenerativa, la fertilidad de los suelos y la defensa del medio rural sin organismos modificados genéticamente (sin OGM).`,
    categorias: Array.from(catSet),
    alergenos_texto: alergenosTexto,
    cierre: `Un producto biológico de calidad superior que llena tu mesa de salud, aroma y respeto por la naturaleza. ¡Añádelo a tu cesta y disfruta de la alimentación auténtica!`
  };

  fs.writeFileSync(fichaPath, JSON.stringify(ficha, null, 2), 'utf-8');
  generatedCount++;
}

console.log(`Existing fichas preserved: ${existingCount}`);
console.log(`Newly generated fichas: ${generatedCount}`);
console.log(`Total fichas now in public/fichas: ${existingCount + generatedCount}`);
