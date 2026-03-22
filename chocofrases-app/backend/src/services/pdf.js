const PDFDocument = require('pdfkit');
const config = require('../config');

const formatARS = (n) => `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

const generateRemito = (order, client, items) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const BROWN = '#4A1C0A';
    const LIGHT = '#FFF8F0';
    const GREY  = '#555555';
    const W     = 495;

    // ── Header bar ──────────────────────────────────────────
    doc.rect(50, 50, W, 80).fill(BROWN);
    doc.fillColor('white').fontSize(26).font('Helvetica-Bold')
       .text(config.business.name, 70, 68);
    doc.fontSize(10).font('Helvetica')
       .text('Fábrica de Chocolates Artesanales', 70, 98);
    doc.fillColor('#C88C50').fontSize(28).font('Helvetica-Bold')
       .text(`REMITO X`, 340, 62, { align: 'right', width: 185 });
    doc.fillColor('white').fontSize(12)
       .text(`N° ${String(order.remito_number).padStart(8, '0')}`, 340, 92, { align: 'right', width: 185 });

    // ── Business info ────────────────────────────────────────
    doc.fillColor(GREY).fontSize(9).font('Helvetica')
       .text(config.business.address || '', 50, 142)
       .text(config.business.email   || '', 50, 154)
       .text(config.business.phone   || '', 50, 166);

    // ── Date ────────────────────────────────────────────────
    const dateStr = new Date(order.created_at).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    doc.text(`Fecha: ${dateStr}`, 350, 142, { align: 'right', width: W - 300 });

    // ── Client box ───────────────────────────────────────────
    doc.rect(50, 185, W, 60).fill(LIGHT);
    doc.fillColor(BROWN).fontSize(9).font('Helvetica-Bold')
       .text('DATOS DEL CLIENTE', 65, 193);
    doc.fillColor(GREY).font('Helvetica').fontSize(10)
       .text(`Nombre / Negocio: ${client.business_name || client.name || client.whatsapp_phone}`, 65, 207)
       .text(`Teléfono: ${client.whatsapp_phone}`, 65, 220)
       .text(`Dirección: ${client.address || order.delivery_address || 'A coordinar'}`, 300, 207);

    // ── Items table header ───────────────────────────────────
    let y = 260;
    doc.rect(50, y, W, 22).fill(BROWN);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
       .text('PRODUCTO',       65,  y + 7)
       .text('CANTIDAD',      300,  y + 7, { width: 70, align: 'center' })
       .text('PRECIO UNIT.',  370,  y + 7, { width: 80, align: 'right' })
       .text('SUBTOTAL',      450,  y + 7, { width: 80, align: 'right' });

    y += 22;
    items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? 'white' : LIGHT;
      doc.rect(50, y, W, 20).fill(bg);
      doc.fillColor(GREY).fontSize(9).font('Helvetica')
         .text(item.product_name,  65,  y + 6)
         .text(`${item.quantity} ${item.unit || ''}`, 300, y + 6, { width: 70, align: 'center' })
         .text(formatARS(item.unit_price), 370, y + 6, { width: 80, align: 'right' })
         .text(formatARS(item.subtotal),   450, y + 6, { width: 80, align: 'right' });
      y += 20;
    });

    // ── Total ────────────────────────────────────────────────
    y += 10;
    doc.rect(350, y, 195, 30).fill(BROWN);
    doc.fillColor('white').fontSize(13).font('Helvetica-Bold')
       .text(`TOTAL: ${formatARS(order.total)}`, 360, y + 8, { width: 175, align: 'right' });

    // ── Notes ────────────────────────────────────────────────
    if (order.notes) {
      doc.fillColor(GREY).fontSize(9).font('Helvetica-Oblique')
         .text(`Observaciones: ${order.notes}`, 50, y + 45);
    }

    // ── Footer ───────────────────────────────────────────────
    doc.rect(50, 760, W, 25).fill(BROWN);
    doc.fillColor('#C88C50').fontSize(8).font('Helvetica')
       .text(`${config.business.name}  |  ${config.business.email || ''}  |  ${config.business.phone || ''}`,
             50, 769, { align: 'center', width: W });

    doc.end();
  });
};

module.exports = { generateRemito };
