import jsPDF from 'jspdf';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';

interface DietPdfOptions {
  title: string;
  dietContent: string;
  productSlugs: string[];
  createdAt: string;
}

const ECOLAND_GREEN = [74, 140, 63] as const; // #4a8c3f
const ECOLAND_DARK = [45, 80, 38] as const;

export const generateDietPdf = async (options: DietPdfOptions) => {
  const { title, dietContent, productSlugs, createdAt } = options;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // === HEADER BAR ===
  doc.setFillColor(...ECOLAND_GREEN);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Logo text (since we can't easily embed the image without async loading)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🌿 ECO LAND', margin, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Productos Ecológicos Certificados · Valladolid', margin, 27);

  // Date on the right
  const dateStr = new Date(createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  doc.setFontSize(9);
  doc.text(dateStr, pageWidth - margin, 27, { align: 'right' });

  y = 45;

  // === TITLE ===
  doc.setTextColor(...ECOLAND_DARK);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const cleanTitle = title.replace(/^#\s*🥗?\s*/, '');
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 5;

  // Divider
  doc.setDrawColor(...ECOLAND_GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // === PRODUCTS TABLE ===
  if (productSlugs.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ECOLAND_DARK);
    doc.text('📦 Productos de la dieta', margin, y);
    y += 8;

    // Table header
    doc.setFillColor(240, 247, 240);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Producto', margin + 3, y);
    doc.text('Marca', margin + 90, y);
    doc.text('Precio', pageWidth - margin - 3, y, { align: 'right' });
    y += 7;

    let totalPrice = 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (const slug of productSlugs) {
      checkPageBreak(7);
      const product = allCatalogProducts.find(p => p.slug === slug);
      const pack = catalogPacks.find(p => p.slug === slug);

      if (product) {
        doc.setTextColor(40, 40, 40);
        doc.text(product.name.substring(0, 50), margin + 3, y);
        doc.setTextColor(120, 120, 120);
        doc.text(product.brand, margin + 90, y);
        doc.setTextColor(...ECOLAND_GREEN);
        doc.text(`${product.price.toFixed(2)}€`, pageWidth - margin - 3, y, { align: 'right' });
        totalPrice += product.price;
      } else if (pack) {
        doc.setTextColor(40, 40, 40);
        doc.text(`📦 ${pack.name.substring(0, 48)}`, margin + 3, y);
        doc.setTextColor(120, 120, 120);
        doc.text('Pack', margin + 90, y);
        doc.setTextColor(...ECOLAND_GREEN);
        doc.text(`${pack.price.toFixed(2)}€`, pageWidth - margin - 3, y, { align: 'right' });
        totalPrice += pack.price;
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text(slug, margin + 3, y);
      }

      // Light row separator
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 6;
    }

    // Total row
    y += 2;
    doc.setFillColor(...ECOLAND_GREEN);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL ESTIMADO', margin + 3, y);
    doc.text(`${totalPrice.toFixed(2)}€`, pageWidth - margin - 3, y, { align: 'right' });
    y += 12;
  }

  // === DIET CONTENT ===
  checkPageBreak(20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ECOLAND_DARK);
  doc.text('🍽️ Plan de comidas', margin, y);
  y += 8;

  // Clean markdown for PDF
  const cleanContent = dietContent
    .replace(/\[\[(product|pack):[a-z0-9-]+\]\]/g, '')
    .replace(/\*\*/g, '')
    .replace(/#{1,3}\s*/g, '')
    .replace(/^- /gm, '• ')
    .trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const lines = cleanContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { y += 3; continue; }

    // Check if it's a day/meal header
    const isDayHeader = /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo|día)/i.test(trimmed);
    const isMealHeader = /^(desayuno|almuerzo|comida|merienda|cena|media mañana)/i.test(trimmed);

    if (isDayHeader) {
      checkPageBreak(12);
      y += 4;
      doc.setFillColor(240, 247, 240);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...ECOLAND_DARK);
      doc.text(trimmed.toUpperCase(), margin + 3, y);
      y += 8;
      continue;
    }

    if (isMealHeader) {
      checkPageBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...ECOLAND_GREEN);
      doc.text(trimmed, margin + 3, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      continue;
    }

    checkPageBreak(5);
    const wrapped = doc.splitTextToSize(trimmed, contentWidth - 6);
    doc.text(wrapped, margin + 3, y);
    y += wrapped.length * 4.5;
  }

  // === FOOTER ===
  const footerY = pageHeight - 20;
  doc.setDrawColor(...ECOLAND_GREEN);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    '⚠️ Esta dieta es orientativa y no sustituye el consejo de un profesional de la salud.',
    margin, footerY
  );
  doc.text(
    'Eco Land · C. de Recondo, 7, 47007 Valladolid · Tel: 983 08 45 39 · hola@ecoland.es',
    margin, footerY + 4
  );
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-ES')} · ecoland.es`,
    pageWidth - margin, footerY + 4, { align: 'right' }
  );

  // Save
  const fileName = `${cleanTitle.replace(/[^a-zA-Z0-9áéíóúñ ]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
};
