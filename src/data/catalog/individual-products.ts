// Productos individuales del catálogo Ecoland
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  weight?: string;
  image: string;
  category: string;
  tags: string[];
  allergens: string[];
  ingredients?: string;
  usage?: string;
  inStock: boolean;
}

// A) DESAYUNOS, CEREALES, COPOS, MUESLIS, GRANOLAS
export const desayunosProducts: CatalogProduct[] = [
  {
    id: 'des-001', slug: 'tropi-muesli-extra-1kg', name: 'Tropi Muesli Extra 1kg', brand: 'El Granero',
    description: 'Muesli tropical con frutas deshidratadas ecológicas', price: 8.95, weight: '1kg',
    image: 'https://images.unsplash.com/photo-1517093728432-a0440f8d45af?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten', 'Frutos secos'], inStock: true
  },
  {
    id: 'des-002', slug: 'muesli-malteado', name: 'Muesli Malteado', brand: 'El Granero',
    description: 'Muesli con malta de cebada ecológica', price: 5.95, weight: '500g',
    image: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-003', slug: 'fibro-muesli', name: 'Fibro Muesli', brand: 'El Granero',
    description: 'Muesli alto en fibra para una digestión saludable', price: 6.50, weight: '500g',
    image: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400', category: 'desayunos',
    tags: ['bio', 'vegano', 'alto-fibra'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-004', slug: 'corn-flakes-bio', name: 'Corn Flakes Bio', brand: 'EcoSana',
    description: 'Copos de maíz ecológicos sin azúcar añadido', price: 4.55, weight: '500g',
    image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400', category: 'desayunos',
    tags: ['bio', 'vegano', 'sin-gluten', 'sin-azucar'], allergens: [], inStock: true
  },
  {
    id: 'des-005', slug: 'bolitas-choco-leche', name: 'Bolitas Cereales Choco Leche', brand: 'EcoSana',
    description: 'Bolitas de cereales con sabor chocolate con leche', price: 4.25, weight: '375g',
    image: 'https://images.unsplash.com/photo-1572357176061-7c9a68b5c0da?w=400', category: 'desayunos',
    tags: ['bio'], allergens: ['Gluten', 'Lácteos'], inStock: true
  },
  {
    id: 'des-006', slug: 'arroz-hinchado', name: 'Arroz Hinchado Ecológico', brand: 'EcoSana',
    description: 'Arroz inflado ligero y crujiente', price: 3.25, weight: '250g',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'desayunos',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'des-007', slug: 'quinoa-hinchada', name: 'Quinoa Hinchada Ecológica', brand: 'EcoSana',
    description: 'Quinoa inflada rica en proteínas', price: 5.10, weight: '250g',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'desayunos',
    tags: ['bio', 'vegano', 'sin-gluten', 'proteina'], allergens: [], inStock: true
  },
  {
    id: 'des-008', slug: 'salvado-avena', name: 'Salvado de Avena', brand: 'Natursana',
    description: 'Salvado de avena ecológico alto en fibra', price: 3.50, weight: '500g',
    image: 'https://images.unsplash.com/photo-1614961909013-a18e8e407f38?w=400', category: 'desayunos',
    tags: ['bio', 'vegano', 'alto-fibra'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-009', slug: 'copos-5-cereales', name: 'Copos 5 Cereales', brand: 'El Granero',
    description: 'Mezcla de copos de avena, trigo, centeno, cebada y espelta', price: 4.25, weight: '500g',
    image: 'https://images.unsplash.com/photo-1517093728432-a0440f8d45af?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-010', slug: 'porridge-chocolate-banana', name: 'Porridge Chocolate Banana', brand: 'Turtle',
    description: 'Avena instantánea con chocolate y banana', price: 5.95, weight: '400g',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-011', slug: 'krunchy-chocolate', name: 'Krunchy Chocolate', brand: 'Barnhouse',
    description: 'Granola crujiente con trozos de chocolate negro', price: 6.75, weight: '375g',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'des-012', slug: 'granola-chocolate-coco', name: 'Granola Chocolate y Coco', brand: 'Ecoland',
    description: 'Granola artesanal con chocolate y coco rallado', price: 7.50, weight: '350g',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400', category: 'desayunos',
    tags: ['bio', 'vegano'], allergens: ['Gluten', 'Frutos secos'], inStock: true
  },
];

// B) SUPERFOODS & SUPLEMENTOS
export const superfoodsProducts: CatalogProduct[] = [
  {
    id: 'sup-001', slug: 'super-green-protein', name: 'Super Green Protein', brand: 'Iswari',
    description: 'Proteína vegetal con superalimentos verdes', price: 15.95, weight: '250g',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769eab?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten', 'proteina'], allergens: [], inStock: true
  },
  {
    id: 'sup-002', slug: 'super-vegan-protein', name: 'Super Vegan Protein', brand: 'Iswari',
    description: 'Mezcla de proteínas de arroz, guisante y cáñamo', price: 11.05, weight: '250g',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten', 'proteina'], allergens: [], inStock: true
  },
  {
    id: 'sup-003', slug: 'matcha-iswari', name: 'Matcha Premium', brand: 'Iswari',
    description: 'Té verde matcha ceremonial japonés en polvo', price: 13.30, weight: '70g',
    image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'sup-004', slug: 'acai-polvo', name: 'Açaí en Polvo', brand: 'Iswari',
    description: 'Polvo de açaí liofilizado rico en antioxidantes', price: 12.50, weight: '100g',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'sup-005', slug: 'chlorella-tabs', name: 'Chlorella en Comprimidos', brand: 'Iswari',
    description: 'Alga chlorella ecológica en tabletas', price: 18.95, weight: '200 tabs',
    image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten', 'detox'], allergens: [], inStock: true
  },
  {
    id: 'sup-006', slug: 'spirulina-polvo', name: 'Espirulina en Polvo', brand: 'Iswari',
    description: 'Espirulina ecológica rica en proteínas y hierro', price: 14.50, weight: '125g',
    image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten', 'proteina'], allergens: [], inStock: true
  },
  {
    id: 'sup-007', slug: 'hierba-trigo', name: 'Hierba de Trigo en Polvo', brand: 'Iswari',
    description: 'Zumo de hierba de trigo deshidratado', price: 11.95, weight: '125g',
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'detox'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'sup-008', slug: 'hierba-cebada-drasanvi', name: 'Hierba de Cebada', brand: 'Drasanvi',
    description: 'Hierba de cebada ecológica en polvo', price: 12.50, weight: '200g',
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'detox'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'sup-009', slug: 'guarana-polvo', name: 'Guaraná en Polvo', brand: 'Inkanat',
    description: 'Guaraná amazónico energizante natural', price: 9.95, weight: '100g',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'sin-gluten', 'energia'], allergens: [], inStock: true
  },
  {
    id: 'sup-010', slug: 'detox-siluet360', name: 'Detox', brand: 'Siluet360',
    description: 'Complemento detox con plantas depurativas', price: 19.90, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'detox'], allergens: [], inStock: true
  },
  {
    id: 'sup-011', slug: 'vientre-plano-siluet360', name: 'Vientre Plano', brand: 'Siluet360',
    description: 'Fórmula para reducir la hinchazón abdominal', price: 19.90, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400', category: 'superfoods',
    tags: ['bio', 'vegano', 'digestion'], allergens: [], inStock: true
  },
  {
    id: 'sup-012', slug: 'garcinia-te-verde', name: 'Garcinia + Té Verde', brand: 'Siluet360',
    description: 'Extracto de garcinia y té verde para control de peso', price: 13.65, weight: '60 caps',
    image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=400', category: 'superfoods',
    tags: ['vegano', 'quema-grasa'], allergens: [], inStock: true
  },
  {
    id: 'sup-013', slug: 'termograss', name: 'Termograss', brand: 'Siluet360',
    description: 'Termogénico natural para acelerar el metabolismo', price: 16.00, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400', category: 'superfoods',
    tags: ['vegano', 'quema-grasa', 'energia'], allergens: [], inStock: true
  },
  {
    id: 'sup-014', slug: 'apple-cider-gummies', name: 'Apple Cider Gummies', brand: 'Siluet360',
    description: 'Gominolas de vinagre de manzana', price: 11.85, weight: '60 gummies',
    image: 'https://images.unsplash.com/photo-1582540730843-f4418f9a7cde?w=400', category: 'superfoods',
    tags: ['vegano', 'digestion'], allergens: [], inStock: true
  },
  {
    id: 'sup-015', slug: 'royal-vit-forte', name: 'Jalea Real Bal-San Forte', brand: 'Royal-Vit',
    description: 'Viales de jalea real fresca con ginseng', price: 26.55, weight: '20 viales',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'superfoods',
    tags: ['energia', 'inmunidad'], allergens: [], inStock: true
  },
];

// C) LEGUMBRES, CONSERVAS VEGETALES
export const legumbresProducts: CatalogProduct[] = [
  {
    id: 'leg-001', slug: 'lentejas-extra', name: 'Lentejas Extra', brand: 'Gumendi',
    description: 'Lentejas cocidas ecológicas listas para consumir', price: 3.35, weight: '700g',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-002', slug: 'lentejas-verduras', name: 'Lentejas con Verduras', brand: 'Gumendi',
    description: 'Lentejas guisadas con verduras ecológicas', price: 3.95, weight: '700g',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-003', slug: 'garbanzo-extra', name: 'Garbanzo Extra', brand: 'Gumendi',
    description: 'Garbanzos cocidos ecológicos', price: 3.10, weight: '660g',
    image: 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b57?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-004', slug: 'alubias-blancas', name: 'Alubias Blancas Extra', brand: 'Gumendi',
    description: 'Alubias blancas cocidas ecológicas', price: 3.25, weight: '700g',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-005', slug: 'tomate-frito', name: 'Tomate Frito Ecológico', brand: 'Gumendi',
    description: 'Tomate frito casero con aceite de oliva', price: 2.35, weight: '310g',
    image: 'https://images.unsplash.com/photo-1534940519139-f860fb3c6e38?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-006', slug: 'tomate-triturado', name: 'Tomate Triturado', brand: 'Gumendi',
    description: 'Tomate triturado ecológico', price: 2.15, weight: '660g',
    image: 'https://images.unsplash.com/photo-1534940519139-f860fb3c6e38?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-007', slug: 'alcachofas-corazones', name: 'Corazones de Alcachofa', brand: 'Gumendi',
    description: 'Corazones de alcachofa en conserva ecológica', price: 4.95, weight: '400g',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886f2b?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-008', slug: 'soja-amarilla', name: 'Soja Amarilla Ecológica', brand: 'EcoSana',
    description: 'Soja amarilla para cocinar o hacer leche vegetal', price: 3.50, weight: '500g',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten', 'proteina'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'leg-009', slug: 'azuki-eco', name: 'Azuki Ecológico', brand: 'EcoSana',
    description: 'Judías azuki para cocina asiática y dulces', price: 4.25, weight: '500g',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-010', slug: 'crema-verduras', name: 'Crema de Verduras', brand: 'Gumendi',
    description: 'Crema de verduras ecológica lista para calentar', price: 3.75, weight: '500g',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-011', slug: 'crema-calabaza', name: 'Crema de Calabaza', brand: 'Gumendi',
    description: 'Crema suave de calabaza ecológica', price: 3.75, weight: '500g',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400', category: 'legumbres',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'leg-012', slug: 'cous-cous-integral', name: 'Cous Cous Integral', brand: 'EcoSana',
    description: 'Cous cous de trigo integral ecológico', price: 2.65, weight: '400g',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400', category: 'legumbres',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
];

// D) SALSAS, CONDIMENTOS, FERMENTADOS
export const salsasProducts: CatalogProduct[] = [
  {
    id: 'sal-001', slug: 'tamari-strong-500', name: 'Tamari Strong 500ml', brand: 'Lima',
    description: 'Salsa de soja tradicional fermentada sin gluten', price: 9.80, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'sal-002', slug: 'tamari-less-salt', name: 'Tamari Less Salt 250ml', brand: 'Lima',
    description: 'Tamari reducido en sal', price: 7.60, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten', 'bajo-sodio'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'sal-003', slug: 'gomasio', name: 'Gomasio', brand: 'Lima',
    description: 'Condimento japonés de sésamo tostado y sal marina', price: 4.60, weight: '225g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Sésamo'], inStock: true
  },
  {
    id: 'sal-004', slug: 'hatcho-miso', name: 'Hatcho Miso', brand: 'Mitoku',
    description: 'Miso oscuro de soja 100% fermentado 2 años', price: 8.25, weight: '300g',
    image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'fermentado'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'sal-005', slug: 'genmai-miso', name: 'Genmai Miso', brand: 'Terra Sana',
    description: 'Miso de arroz integral y soja', price: 9.15, weight: '350g',
    image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'fermentado'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'sal-006', slug: 'barley-miso', name: 'Barley Miso', brand: 'Clearspring',
    description: 'Miso de cebada y soja no pasteurizado', price: 13.30, weight: '300g',
    image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'fermentado'], allergens: ['Soja', 'Gluten'], inStock: true
  },
  {
    id: 'sal-007', slug: 'umeboshi-paste', name: 'Umeboshi Paste', brand: 'Clearspring',
    description: 'Pasta de ciruela umeboshi japonesa', price: 12.75, weight: '150g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten', 'fermentado'], allergens: [], inStock: true
  },
  {
    id: 'sal-008', slug: 'chucrut-360', name: 'Chucrut Ecológico 360g', brand: 'NaturSoy',
    description: 'Col fermentada rica en probióticos', price: 2.35, weight: '360g',
    image: 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten', 'fermentado', 'probiotico'], allergens: [], inStock: true
  },
  {
    id: 'sal-009', slug: 'chucrut-680', name: 'Chucrut Ecológico 680g', brand: 'NaturSoy',
    description: 'Col fermentada formato familiar', price: 4.00, weight: '680g',
    image: 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten', 'fermentado', 'probiotico'], allergens: [], inStock: true
  },
  {
    id: 'sal-010', slug: 'mostaza-francesa', name: 'Mostaza Francesa', brand: 'NaturSoy',
    description: 'Mostaza de Dijon ecológica', price: 3.99, weight: '200g',
    image: 'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=400', category: 'salsas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Mostaza'], inStock: true
  },
  {
    id: 'sal-011', slug: 'pate-tofu-algas', name: 'Paté Tofu con Algas', brand: 'Vegetalia',
    description: 'Paté vegetal de tofu con algas marinas', price: 3.50, weight: '110g',
    image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400', category: 'salsas',
    tags: ['bio', 'vegano'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'sal-012', slug: 'pate-boletus', name: 'Paté de Boletus', brand: 'Vegetalia',
    description: 'Paté vegetal de setas boletus', price: 3.75, weight: '110g',
    image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400', category: 'salsas',
    tags: ['bio', 'vegano'], allergens: ['Soja'], inStock: true
  },
];

// E) ENDULZANTES Y SIROPES
export const endulzantesProducts: CatalogProduct[] = [
  {
    id: 'end-001', slug: 'neera-500', name: 'Sirope Neera 500ml', brand: 'Madal Bal',
    description: 'Sirope de savia de palma y arce para ayunos', price: 19.95, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'endulzantes',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'end-002', slug: 'neera-1000', name: 'Sirope Neera 1000ml', brand: 'Madal Bal',
    description: 'Sirope de savia formato grande', price: 34.50, weight: '1000ml',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'endulzantes',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'end-003', slug: 'azucar-abedul', name: 'Azúcar de Abedul (Xilitol)', brand: 'EcoSana',
    description: 'Edulcorante natural bajo en calorías', price: 8.60, weight: '500g',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'endulzantes',
    tags: ['vegano', 'sin-gluten', 'sin-azucar', 'bajo-calorias'], allergens: [], inStock: true
  },
  {
    id: 'end-004', slug: 'maple-arce', name: 'Sirope de Arce 250ml', brand: 'Terra Sana',
    description: 'Sirope de arce puro canadiense grado A', price: 10.20, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1589496933738-f5c27f4cf7f4?w=400', category: 'endulzantes',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'end-005', slug: 'azucar-coco', name: 'Azúcar de Coco', brand: 'Iswari',
    description: 'Azúcar de flor de coco bajo índice glucémico', price: 6.95, weight: '250g',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'endulzantes',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'end-006', slug: 'eritritol', name: 'Eritritol Ecológico', brand: 'NaturGreen',
    description: 'Edulcorante sin calorías de origen natural', price: 7.50, weight: '500g',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'endulzantes',
    tags: ['bio', 'vegano', 'sin-gluten', 'sin-azucar', 'sin-calorias'], allergens: [], inStock: true
  },
];

// F) CAFÉ, CACAO, BEBIDAS
export const bebidasProducts: CatalogProduct[] = [
  {
    id: 'beb-001', slug: 'cafe-comercio-justo', name: 'Café Arábica Comercio Justo', brand: 'Comercio Justo',
    description: 'Café 100% arábica de comercio justo molido', price: 5.15, weight: '250g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'comercio-justo'], allergens: [], inStock: true
  },
  {
    id: 'beb-002', slug: 'cafe-colombia', name: 'Café Colombia 500g', brand: 'Álter Nativa',
    description: 'Café de origen Colombia, notas a caramelo y frutos', price: 15.40, weight: '500g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'comercio-justo'], allergens: [], inStock: true
  },
  {
    id: 'beb-003', slug: 'cafe-brasil', name: 'Café Brasil 500g', brand: 'Álter Nativa',
    description: 'Café brasileño suave y aromático', price: 14.70, weight: '500g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'comercio-justo'], allergens: [], inStock: true
  },
  {
    id: 'beb-004', slug: 'cafe-ethiopia', name: 'Café Ethiopie Moka', brand: 'Destination',
    description: 'Café de origen etíope con notas florales', price: 6.65, weight: '250g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'beb-005', slug: 'biocoffee-liofilizado', name: 'BioCoffee Liofilizado', brand: 'NaturGreen',
    description: 'Café soluble ecológico liofilizado', price: 6.90, weight: '100g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'beb-006', slug: 'yannoh', name: 'Yannoh Sustituto Café', brand: 'Lima',
    description: 'Sucedáneo de café sin cafeína con cereales', price: 11.90, weight: '250g',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-cafeina'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'beb-007', slug: 'chocolate-vivani-negro', name: 'Chocolate Negro 85%', brand: 'Vivani',
    description: 'Chocolate negro ecológico intenso', price: 3.95, weight: '100g',
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'beb-008', slug: 'chocolate-sole-70', name: 'Chocolate 70% Cacao', brand: 'Solé',
    description: 'Chocolate negro con 70% de cacao', price: 3.50, weight: '100g',
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'beb-009', slug: 'bebida-soja', name: 'Bebida de Soja Ecológica', brand: 'NaturGreen',
    description: 'Leche de soja sin azúcares añadidos', price: 2.50, weight: '1L',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten', 'sin-azucar'], allergens: ['Soja'], inStock: true
  },
  {
    id: 'beb-010', slug: 'bebida-almendra', name: 'Bebida de Almendra', brand: 'EcoMil',
    description: 'Leche de almendra ecológica', price: 3.25, weight: '1L',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'beb-011', slug: 'bebida-avena', name: 'Bebida de Avena', brand: 'NaturGreen',
    description: 'Leche de avena ecológica sin azúcar', price: 2.50, weight: '1L',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-azucar'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'beb-012', slug: 'kombucha-jengibre', name: 'Kombucha Jengibre', brand: 'Komvida',
    description: 'Kombucha artesanal con jengibre fresco', price: 3.95, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten', 'probiotico'], allergens: [], inStock: true
  },
  {
    id: 'beb-013', slug: 'zumo-manzana-jengibre', name: 'Zumo Manzana y Jengibre', brand: 'Jugoso',
    description: 'Zumo prensado en frío de manzana con jengibre', price: 3.50, weight: '750ml',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'beb-014', slug: 'zumo-naranja-zanahoria', name: 'Zumo Naranja y Zanahoria', brand: 'Jugoso',
    description: 'Zumo de naranja y zanahoria ecológico', price: 3.95, weight: '750ml',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
];

// G) ACEITES Y VINAGRES
export const aceitesProducts: CatalogProduct[] = [
  {
    id: 'ace-001', slug: 'aceite-oliva-1l', name: 'Aceite Oliva Virgen Extra 1L', brand: 'El Lagar del Soto',
    description: 'AOVE ecológico de primera prensión en frío', price: 14.00, weight: '1L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-002', slug: 'aceite-oliva-2l', name: 'Aceite Oliva Virgen Extra 2L', brand: 'El Lagar del Soto',
    description: 'AOVE ecológico formato ahorro', price: 25.90, weight: '2L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-003', slug: 'aceite-oliva-5l', name: 'Aceite Oliva Virgen Extra 5L', brand: 'El Lagar del Soto',
    description: 'AOVE ecológico garrafa familiar', price: 62.50, weight: '5L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-004', slug: 'aceite-sesamo', name: 'Aceite de Sésamo 250ml', brand: 'NaturGreen',
    description: 'Aceite de sésamo tostado para cocina asiática', price: 5.60, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Sésamo'], inStock: true
  },
  {
    id: 'ace-005', slug: 'aceite-lino', name: 'Aceite de Lino 250ml', brand: 'NaturGreen',
    description: 'Aceite de lino rico en omega-3', price: 4.85, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten', 'omega3'], allergens: [], inStock: true
  },
  {
    id: 'ace-006', slug: 'aceite-aguacate', name: 'Aceite de Aguacate 250ml', brand: 'NaturGreen',
    description: 'Aceite de aguacate para cocinar a alta temperatura', price: 11.80, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-007', slug: 'aceite-coco', name: 'Aceite de Coco Virgen', brand: 'Biolabrador',
    description: 'Aceite de coco virgen extra ecológico', price: 8.95, weight: '500ml',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-008', slug: 'vinagre-manzana', name: 'Vinagre de Manzana', brand: 'EcoSana',
    description: 'Vinagre de manzana ecológico', price: 2.85, weight: '750ml',
    image: 'https://images.unsplash.com/photo-1628519912825-92dc30a7c4df?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-009', slug: 'vinagre-manzana-sin-filtrar', name: 'Vinagre Manzana Sin Filtrar', brand: 'EcoSana',
    description: 'Vinagre de manzana con madre', price: 3.95, weight: '750ml',
    image: 'https://images.unsplash.com/photo-1628519912825-92dc30a7c4df?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten', 'probiotico'], allergens: [], inStock: true
  },
  {
    id: 'ace-010', slug: 'vinagre-arroz', name: 'Vinagre de Arroz Integral', brand: 'Clearspring',
    description: 'Vinagre de arroz integral japonés', price: 4.75, weight: '150ml',
    image: 'https://images.unsplash.com/photo-1628519912825-92dc30a7c4df?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'ace-011', slug: 'vinagre-balsamico', name: 'Vinagre Balsámico Aged', brand: 'La Bio Idea',
    description: 'Vinagre balsámico de Módena añejado', price: 10.40, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1628519912825-92dc30a7c4df?w=400', category: 'aceites',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
];

// H) PANADERÍA Y GALLETAS
export const panaderiaProducts: CatalogProduct[] = [
  {
    id: 'pan-001', slug: 'pan-centeno', name: 'Pan de Centeno 250g', brand: 'NaturSoy',
    description: 'Pan de centeno integral ecológico', price: 2.20, weight: '250g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'pan-002', slug: 'pan-centeno-proteico', name: 'Pan Centeno Proteico', brand: 'NaturSoy',
    description: 'Pan de centeno con semillas alto en proteínas', price: 2.85, weight: '250g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'panaderia',
    tags: ['bio', 'vegano', 'proteina'], allergens: ['Gluten', 'Sésamo'], inStock: true
  },
  {
    id: 'pan-003', slug: 'biscotes-integral', name: 'Biscotes Integrales 270g', brand: 'Arrasate',
    description: 'Biscotes de pan integral tostado', price: 3.15, weight: '270g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'pan-004', slug: 'colines-sesamo', name: 'Colines de Sésamo 200g', brand: 'Biogredos',
    description: 'Palitos de pan con sésamo', price: 2.60, weight: '200g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten', 'Sésamo'], inStock: true
  },
  {
    id: 'pan-005', slug: 'galletas-avena-pasas', name: 'Galletas Avena y Pasas', brand: 'Biogredos',
    description: 'Galletas de avena con pasas ecológicas', price: 3.15, weight: '200g',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'pan-006', slug: 'galletas-desayuno-choco', name: 'Galletas Desayuno Choco', brand: 'Biogredos',
    description: 'Galletas de desayuno con chips de chocolate', price: 3.00, weight: '200g',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
  {
    id: 'pan-007', slug: 'tortitas-maiz', name: 'Tortitas de Maíz Clásicas', brand: 'Biocop',
    description: 'Tortitas de maíz ecológicas sin sal', price: 1.50, weight: '120g',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'panaderia',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'pan-008', slug: 'tortitas-arroz', name: 'Tortitas de Arroz Clásicas', brand: 'Biocop',
    description: 'Tortitas de arroz integral ecológicas', price: 2.79, weight: '200g',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'panaderia',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'pan-009', slug: 'tortitas-multicereales', name: 'Tortitas Multicereales', brand: 'Biocop',
    description: 'Tortitas con mezcla de cereales', price: 2.79, weight: '200g',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'panaderia',
    tags: ['bio', 'vegano'], allergens: ['Gluten'], inStock: true
  },
];

// I) CONSERVAS DEL MAR
export const conservasMarProducts: CatalogProduct[] = [
  {
    id: 'mar-001', slug: 'atun-natural', name: 'Atún al Natural 120g', brand: 'Pan do Mar',
    description: 'Atún claro en agua mineral', price: 2.65, weight: '120g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-002', slug: 'sardinas-aceite', name: 'Sardinas en Aceite 120g', brand: 'Pan do Mar',
    description: 'Sardinas en aceite de oliva ecológico', price: 3.25, weight: '120g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-003', slug: 'atun-escabeche', name: 'Atún en Escabeche 120g', brand: 'Pan do Mar',
    description: 'Atún claro en escabeche suave', price: 3.30, weight: '120g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-004', slug: 'pate-algas', name: 'Paté de Algas 125g', brand: 'Pan do Mar',
    description: 'Paté vegetal con algas marinas', price: 2.80, weight: '125g',
    image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400', category: 'conservas-mar',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'mar-005', slug: 'pate-sardinas', name: 'Paté de Sardinas 125g', brand: 'Pan do Mar',
    description: 'Paté untable de sardinas', price: 3.00, weight: '125g',
    image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-006', slug: 'bonito-norte-220', name: 'Atún Blanco Bonito Norte 220g', brand: 'Pan do Mar',
    description: 'Bonito del norte en aceite de oliva', price: 8.55, weight: '220g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten', 'premium'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-007', slug: 'atun-claro-ortiz', name: 'Atún Claro Ortiz 220g', brand: 'Ortiz',
    description: 'Atún claro premium en aceite de oliva', price: 8.95, weight: '220g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['sin-gluten', 'premium'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-008', slug: 'bonito-biocop', name: 'Bonito del Norte BioCop 195g', brand: 'BioCop',
    description: 'Bonito del norte ecológico', price: 8.95, weight: '195g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten', 'premium'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-009', slug: 'caballa-filetes', name: 'Filetes de Caballa 220g', brand: 'Pan do Mar',
    description: 'Filetes de caballa en aceite de oliva', price: 7.00, weight: '220g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-010', slug: 'ventresca-atun', name: 'Ventresca de Atún 120g', brand: 'Pan do Mar',
    description: 'Ventresca de atún premium', price: 6.55, weight: '120g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['bio', 'sin-gluten', 'premium'], allergens: ['Pescado'], inStock: true
  },
  {
    id: 'mar-011', slug: 'melva-pesasur', name: 'Filetes de Melva 195g', brand: 'Pesasur',
    description: 'Filetes de melva en aceite de oliva', price: 8.80, weight: '195g',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', category: 'conservas-mar',
    tags: ['sin-gluten', 'premium'], allergens: ['Pescado'], inStock: true
  },
];

// J) COSMÉTICA NATURAL Y CBD
export const cosmeticaProducts: CatalogProduct[] = [
  {
    id: 'cos-001', slug: 'crema-facial-canamo', name: 'Crema Facial Cáñamo 50ml', brand: 'Drasanvi',
    description: 'Crema facial hidratante con aceite de cáñamo', price: 20.95, weight: '50ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-002', slug: 'serum-canamo', name: 'Sérum Cáñamo Spray 30ml', brand: 'Drasanvi',
    description: 'Sérum facial con aceite de cáñamo', price: 14.60, weight: '30ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-003', slug: 'mousse-desmaquillante-canamo', name: 'Mousse Desmaquillante Cáñamo', brand: 'Drasanvi',
    description: 'Mousse suave para desmaquillar', price: 11.45, weight: '150ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-004', slug: 'gel-bano-canamo', name: 'Gel Baño Cáñamo 250ml', brand: 'Drasanvi',
    description: 'Gel de ducha suave con cáñamo', price: 6.15, weight: '250ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-005', slug: 'oleo-cbd-30', name: 'Óleo CBD 30%', brand: 'Drasanvi',
    description: 'Aceite de CBD concentrado al 30%', price: 70.00, weight: '10ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano', 'cbd'], allergens: [], inStock: true
  },
  {
    id: 'cos-006', slug: 'aceite-cbd-10', name: 'Aceite CBD 10%', brand: 'Drasanvi',
    description: 'Aceite de CBD al 10%', price: 55.00, weight: '10ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano', 'cbd'], allergens: [], inStock: true
  },
  {
    id: 'cos-007', slug: 'balsamo-cbd', name: 'Bálsamo Corporal CBD 200ml', brand: 'Drasanvi',
    description: 'Bálsamo corporal con CBD', price: 15.00, weight: '200ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano', 'cbd'], allergens: [], inStock: true
  },
  {
    id: 'cos-008', slug: 'crema-rosa-mosqueta', name: 'Crema Facial Rosa Mosqueta 50ml', brand: 'Drasanvi',
    description: 'Crema regeneradora con rosa mosqueta', price: 20.95, weight: '50ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-009', slug: 'crema-argan', name: 'Crema Facial Argán 50ml', brand: 'Drasanvi',
    description: 'Crema nutritiva con aceite de argán', price: 20.95, weight: '50ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-010', slug: 'spray-solar-spf30', name: 'Spray Solar SPF30', brand: 'Alga Maris',
    description: 'Protector solar en spray resistente al agua', price: 20.90, weight: '125ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'vegano'], allergens: [], inStock: true
  },
  {
    id: 'cos-011', slug: 'weleda-skin-food', name: 'Skin Food Original', brand: 'Weleda',
    description: 'Crema nutritiva intensiva multiusos', price: 12.95, weight: '75ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio'], allergens: [], inStock: true
  },
  {
    id: 'cos-012', slug: 'weleda-bebe-calendula', name: 'Crema Pañal Caléndula Bebé', brand: 'Weleda',
    description: 'Crema protectora para zona del pañal', price: 9.10, weight: '75ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'cosmetica',
    tags: ['bio', 'bebe'], allergens: [], inStock: true
  },
];

// K) PRODUCTOS A GRANEL
export const granelProducts: CatalogProduct[] = [
  {
    id: 'gra-001', slug: 'almendras-granel', name: 'Almendras Crudas', brand: 'Granel',
    description: 'Almendras crudas ecológicas a granel', price: 2.80, weight: '100g',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160bfcbc?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'gra-002', slug: 'nueces-granel', name: 'Nueces de California', brand: 'Granel',
    description: 'Nueces peladas ecológicas', price: 3.20, weight: '100g',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160bfcbc?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten', 'omega3'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'gra-003', slug: 'anacardos-granel', name: 'Anacardos Crudos', brand: 'Granel',
    description: 'Anacardos crudos ecológicos', price: 3.50, weight: '100g',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160bfcbc?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'gra-004', slug: 'pistachos-granel', name: 'Pistachos Tostados', brand: 'Granel',
    description: 'Pistachos tostados con sal', price: 4.50, weight: '100g',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160bfcbc?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'gra-005', slug: 'datiles-medjool', name: 'Dátiles Medjool', brand: 'Granel',
    description: 'Dátiles Medjool grandes y jugosos', price: 2.90, weight: '100g',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-006', slug: 'orejones-granel', name: 'Orejones de Albaricoque', brand: 'Granel',
    description: 'Albaricoques secos ecológicos', price: 2.20, weight: '100g',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-007', slug: 'bayas-goji', name: 'Bayas de Goji', brand: 'Granel',
    description: 'Bayas de goji deshidratadas', price: 3.80, weight: '100g',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-008', slug: 'wakame-granel', name: 'Alga Wakame', brand: 'Granel',
    description: 'Alga wakame seca para sopas y ensaladas', price: 4.50, weight: '50g',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-009', slug: 'curcuma-granel', name: 'Cúrcuma en Polvo', brand: 'Granel',
    description: 'Cúrcuma ecológica molida', price: 1.80, weight: '50g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-010', slug: 'semilla-chia', name: 'Semillas de Chía', brand: 'EcoSana',
    description: 'Semillas de chía ecológicas ricas en omega-3', price: 4.95, weight: '500g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten', 'omega3'], allergens: [], inStock: true
  },
  {
    id: 'gra-011', slug: 'semilla-sesamo', name: 'Semillas de Sésamo', brand: 'EcoSana',
    description: 'Sésamo natural ecológico', price: 4.20, weight: '500g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Sésamo'], inStock: true
  },
  {
    id: 'gra-012', slug: 'tahin', name: 'Tahini (Crema de Sésamo)', brand: 'NaturSoy',
    description: 'Pasta de sésamo tostado', price: 9.60, weight: '500g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Sésamo'], inStock: true
  },
  {
    id: 'gra-013', slug: 'crema-cacahuete', name: 'Crema de Cacahuete', brand: 'Monki',
    description: 'Mantequilla de cacahuete 100% natural', price: 5.40, weight: '330g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: ['Cacahuetes'], inStock: true
  },
  {
    id: 'gra-014', slug: 'crema-cacao-avellanas', name: 'Crema Cacao y Avellanas', brand: 'EcoSana',
    description: 'Crema de cacao con avellanas sin aceite de palma', price: 3.85, weight: '200g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano'], allergens: ['Frutos secos'], inStock: true
  },
  {
    id: 'gra-015', slug: 'mermelada-fresa', name: 'Mermelada de Fresa', brand: 'EcoSana',
    description: 'Mermelada de fresa ecológica', price: 4.10, weight: '260g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-016', slug: 'mermelada-naranja', name: 'Mermelada de Naranja', brand: 'EcoSana',
    description: 'Mermelada de naranja amarga ecológica', price: 4.10, weight: '260g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-017', slug: 'coco-rallado', name: 'Coco Rallado Ecológico', brand: 'EcoSana',
    description: 'Coco rallado sin azúcar añadido', price: 2.50, weight: '150g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-018', slug: 'miel-milflores', name: 'Miel Mil Flores', brand: 'Ecoflor',
    description: 'Miel cruda ecológica multifloral', price: 6.25, weight: '500g',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'granel',
    tags: ['bio', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-019', slug: 'miel-eucalipto', name: 'Miel de Eucalipto', brand: 'Ecoflor',
    description: 'Miel de eucalipto ecológica para las vías respiratorias', price: 6.95, weight: '500g',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'granel',
    tags: ['bio', 'sin-gluten', 'inmunidad'], allergens: [], inStock: true
  },
  {
    id: 'gra-020', slug: 'ajo-negro', name: 'Ajo Negro Ecológico', brand: 'Granel',
    description: 'Ajo negro fermentado rico en antioxidantes', price: 5.75, weight: '70g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten', 'inmunidad'], allergens: [], inStock: true
  },
  {
    id: 'gra-021', slug: 'trigo-sarraceno', name: 'Trigo Sarraceno Ecológico', brand: 'EcoSana',
    description: 'Trigo sarraceno sin gluten para cocinar', price: 3.50, weight: '500g',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
  {
    id: 'gra-022', slug: 'mayonesa-bio', name: 'Mayonesa Bio', brand: 'ArteOliva',
    description: 'Mayonesa ecológica con huevo campero', price: 2.25, weight: '125ml',
    image: 'https://images.unsplash.com/photo-1596591868231-a9a28d14e4f8?w=400', category: 'granel',
    tags: ['bio', 'sin-gluten'], allergens: ['Huevo'], inStock: true
  },
];

// Infusiones y tés (añadidas como subcategoría de bebidas)
export const infusionesProducts: CatalogProduct[] = [
  {
    id: 'inf-001', slug: 'yogi-tea-detox', name: 'Yogi Tea Detox', brand: 'Yogi Tea',
    description: 'Infusión ayurvédica depurativa', price: 5.00, weight: '17 bolsitas',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten', 'detox'], allergens: [], inStock: true
  },
  {
    id: 'inf-002', slug: 'yogi-tea-digestion', name: 'Yogi Tea Digestión', brand: 'Yogi Tea',
    description: 'Infusión para una digestión saludable', price: 3.90, weight: '17 bolsitas',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten', 'digestion'], allergens: [], inStock: true
  },
  {
    id: 'inf-003', slug: 'yogi-tea-christmas', name: 'Yogi Tea Christmas', brand: 'Yogi Tea',
    description: 'Infusión especiada navideña', price: 3.90, weight: '17 bolsitas',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', category: 'bebidas',
    tags: ['bio', 'vegano', 'sin-gluten'], allergens: [], inStock: true
  },
];

// Exportar todos los productos
export const allCatalogProducts: CatalogProduct[] = [
  ...desayunosProducts,
  ...superfoodsProducts,
  ...legumbresProducts,
  ...salsasProducts,
  ...endulzantesProducts,
  ...bebidasProducts,
  ...infusionesProducts,
  ...aceitesProducts,
  ...panaderiaProducts,
  ...conservasMarProducts,
  ...cosmeticaProducts,
  ...granelProducts,
];

export const getCatalogProductBySlug = (slug: string) => allCatalogProducts.find(p => p.slug === slug);
export const getCatalogProductsByCategory = (category: string) => allCatalogProducts.filter(p => p.category === category);
export const searchCatalogProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return allCatalogProducts.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.brand.toLowerCase().includes(lowercaseQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowercaseQuery))
  );
};
