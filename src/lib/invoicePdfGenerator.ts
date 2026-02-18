import jsPDF from 'jspdf';

interface OrderItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code?: string | null;
  items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

const GREEN = [74, 140, 63] as const;
const DARK = [45, 80, 38] as const;

export const generateInvoicePdf = (data: InvoiceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const m = 18;
  const cw = pw - m * 2;
  let y = 0;

  // Header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pw, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ECO LAND', m, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Productos Ecologicos Certificados · Valladolid', m, 22);
  doc.text('CIF: B00000000 · C. de Recondo, 7, 47007 Valladolid', pw - m, 22, { align: 'right' });

  y = 42;

  // Invoice title
  doc.setTextColor(...DARK);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', m, y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`N.o ${data.order_number}`, m + 55, y);
  y += 10;

  // Date and customer info
  const dateStr = new Date(data.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Fecha: ${dateStr}`, m, y);
  y += 5;
  if (data.customer_name) {
    doc.text(`Cliente: ${data.customer_name}`, m, y);
    y += 5;
  }
  if (data.customer_email) {
    doc.text(`Email: ${data.customer_email}`, m, y);
    y += 5;
  }
  if (data.shipping_address) {
    doc.text(`Direccion: ${data.shipping_address}${data.shipping_city ? ', ' + data.shipping_city : ''}`, m, y);
    y += 5;
  }
  y += 8;

  // Table header
  doc.setFillColor(235, 245, 235);
  doc.rect(m, y - 4, cw, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('Producto', m + 4, y + 1);
  doc.text('Ud.', m + 110, y + 1);
  doc.text('P. Unit.', m + 125, y + 1);
  doc.text('Total', pw - m - 4, y + 1, { align: 'right' });
  y += 9;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  for (const item of data.items) {
    doc.setTextColor(40, 40, 40);
    const name = item.item_name.length > 60 ? item.item_name.substring(0, 57) + '...' : item.item_name;
    doc.text(name, m + 4, y);
    doc.text(String(item.quantity), m + 112, y);
    doc.text(`${item.unit_price.toFixed(2)} EUR`, m + 125, y);
    doc.setTextColor(...GREEN);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.total_price.toFixed(2)} EUR`, pw - m - 4, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.line(m, y + 2.5, pw - m, y + 2.5);
    y += 6;
  }

  y += 6;

  // Totals
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal:', pw - m - 50, y);
  doc.text(`${data.subtotal.toFixed(2)} EUR`, pw - m - 4, y, { align: 'right' });
  y += 6;
  doc.text('Envio:', pw - m - 50, y);
  doc.text(`${data.shipping_cost.toFixed(2)} EUR`, pw - m - 4, y, { align: 'right' });
  y += 8;

  doc.setFillColor(...GREEN);
  doc.rect(pw - m - 70, y - 5, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', pw - m - 66, y + 1);
  doc.text(`${data.total.toFixed(2)} EUR`, pw - m - 4, y + 1, { align: 'right' });

  // Footer
  const fy = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 210, 200);
  doc.setLineWidth(0.3);
  doc.line(m, fy - 3, pw - m, fy - 3);
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.text('Eco Land · C. de Recondo, 7, 47007 Valladolid · Tel: 983 08 45 39 · hola@ecoland.es', m, fy);
  doc.text('ecoland.es', pw - m, fy, { align: 'right' });

  doc.save(`factura-${data.order_number}.pdf`);
};
