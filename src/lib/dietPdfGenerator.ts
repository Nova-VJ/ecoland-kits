import jsPDF from 'jspdf';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';

interface DietPdfOptions {
  title: string;
  dietContent: string;
  productSlugs: string[];
  createdAt: string;
}

const ECOLAND_GREEN = [74, 140, 63] as const;
const ECOLAND_DARK = [45, 80, 38] as const;
const TEXT_DARK = [40, 40, 40] as const;
const TEXT_LIGHT = [120, 120, 120] as const;

export const generateDietPdf = async (options: DietPdfOptions) => {
  const { title, dietContent, productSlugs, createdAt } = options;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      addFooter();
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const addFooter = () => {
    const fy = pageHeight - 15;
    doc.setDrawColor(200, 210, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, fy - 3, pageWidth - margin, fy - 3);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'italic');
    doc.text('Esta dieta es orientativa y no sustituye el consejo de un profesional de la salud.', margin, fy);
    doc.setFont('helvetica', 'normal');
    doc.text('Eco Land · C. de Recondo, 7, 47007 Valladolid · Tel: 983 08 45 39 · hola@ecoland.es', margin, fy + 4);
    doc.text(`ecoland.es`, pageWidth - margin, fy + 4, { align: 'right' });
  };

  // === HEADER ===
  doc.setFillColor(...ECOLAND_GREEN);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ECO LAND', margin, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Productos Ecologicos Certificados · Valladolid', margin, 22);
  const dateStr = new Date(createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  doc.text(dateStr, pageWidth - margin, 22, { align: 'right' });

  y = 40;

  // === TITLE ===
  doc.setTextColor(...ECOLAND_DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const cleanTitle = title.replace(/^#\s*🥗?\s*/, '').trim();
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 6;

  doc.setDrawColor(...ECOLAND_GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === PRODUCTS TABLE ===
  if (productSlugs.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ECOLAND_DARK);
    doc.text('Productos de la dieta', margin, y);
    y += 8;

    // Table header
    doc.setFillColor(235, 245, 235);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Producto', margin + 4, y);
    doc.text('Marca', margin + 100, y);
    doc.text('Precio', pageWidth - margin - 4, y, { align: 'right' });
    y += 7;

    let totalPrice = 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    for (const slug of productSlugs) {
      checkPageBreak(7);
      const product = allCatalogProducts.find(p => p.slug === slug);
      const pack = catalogPacks.find(p => p.slug === slug);

      if (product) {
        doc.setTextColor(...TEXT_DARK);
        const name = product.name.length > 55 ? product.name.substring(0, 52) + '...' : product.name;
        doc.text(name, margin + 4, y);
        doc.setTextColor(...TEXT_LIGHT);
        doc.text(product.brand, margin + 100, y);
        doc.setTextColor(...ECOLAND_GREEN);
        doc.setFont('helvetica', 'bold');
        doc.text(`${product.price.toFixed(2)} EUR`, pageWidth - margin - 4, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        totalPrice += product.price;
      } else if (pack) {
        doc.setTextColor(...TEXT_DARK);
        const name = pack.name.length > 55 ? pack.name.substring(0, 52) + '...' : pack.name;
        doc.text(`Pack: ${name}`, margin + 4, y);
        doc.setTextColor(...TEXT_LIGHT);
        doc.text('Pack', margin + 100, y);
        doc.setTextColor(...ECOLAND_GREEN);
        doc.setFont('helvetica', 'bold');
        doc.text(`${pack.price.toFixed(2)} EUR`, pageWidth - margin - 4, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        totalPrice += pack.price;
      } else {
        doc.setTextColor(180, 180, 180);
        doc.text(slug, margin + 4, y);
      }

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.15);
      doc.line(margin, y + 2.5, pageWidth - margin, y + 2.5);
      y += 6;
    }

    // Total
    y += 3;
    doc.setFillColor(...ECOLAND_GREEN);
    doc.rect(margin, y - 4, contentWidth, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL ESTIMADO', margin + 4, y + 1);
    doc.text(`${totalPrice.toFixed(2)} EUR`, pageWidth - margin - 4, y + 1, { align: 'right' });
    y += 14;
  }

  // === DIET CONTENT — structured parsing ===
  checkPageBreak(15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ECOLAND_DARK);
  doc.text('Plan de comidas', margin, y);
  y += 10;

  // Remove product references and clean up for PDF
  const cleanContent = dietContent
    .replace(/\[\[(product|pack):[a-z0-9-]+\]\]/g, '')
    .trim();

  const lines = cleanContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { y += 2; continue; }

    // Remove markdown bold markers
    const text = trimmed.replace(/\*\*/g, '');

    // Day headers (## or ### with day names)
    const isDayHeader = /^#{1,3}\s*(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|d[ií]a|men[uú]|semana)/i.test(text) ||
      /^(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)/i.test(text.replace(/^#{1,3}\s*/, ''));

    // Meal headers
    const cleanText = text.replace(/^#{1,3}\s*/, '');
    const isMealHeader = /^(desayuno|almuerzo|comida|merienda|cena|media ma[ñn]ana|pre.?entreno|post.?entreno|snack|recuperaci[oó]n)/i.test(cleanText);

    // Section headers (## or ### not matching above)
    const isSectionHeader = /^#{1,3}\s+/.test(text) && !isDayHeader && !isMealHeader;

    if (isDayHeader) {
      checkPageBreak(14);
      y += 5;
      doc.setFillColor(235, 245, 235);
      doc.rect(margin, y - 4.5, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...ECOLAND_DARK);
      doc.text(cleanText.toUpperCase(), margin + 4, y);
      y += 8;
      continue;
    }

    if (isMealHeader) {
      checkPageBreak(10);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...ECOLAND_GREEN);
      doc.text(cleanText, margin + 4, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_DARK);
      continue;
    }

    if (isSectionHeader) {
      checkPageBreak(12);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...ECOLAND_DARK);
      const headerText = cleanText;
      doc.text(headerText, margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      continue;
    }

    // Bullet points
    const isBullet = /^[-•*]\s/.test(text);
    const bulletText = isBullet ? text.replace(/^[-•*]\s+/, '') : text;
    const indent = isBullet ? 6 : 0;

    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_DARK);

    if (isBullet) {
      doc.text('•', margin + 4, y);
    }

    const wrapped = doc.splitTextToSize(bulletText, contentWidth - indent - 8);
    doc.text(wrapped, margin + 4 + indent, y);
    y += wrapped.length * 4.2 + 1;
  }

  // Add footer to last page
  addFooter();

  // Save
  const fileName = `dieta-ecoland-${cleanTitle.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase().substring(0, 40)}.pdf`;
  doc.save(fileName);
};
