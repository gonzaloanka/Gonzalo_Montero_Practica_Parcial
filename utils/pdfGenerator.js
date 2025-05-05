const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateDeliveryNotePdf = (deliveryNote, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(16).text('Albarán', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Proyecto: ${deliveryNote.project?.name || 'Sin nombre'}`);
    doc.text(`Cliente: ${deliveryNote.project?.client?.name || 'Sin cliente'}`);
    doc.text(`Usuario: ${deliveryNote.user?.personal?.name || ''} ${deliveryNote.user?.personal?.lastname || ''}`);
    doc.text(`Correo: ${deliveryNote.user?.email || 'Sin correo'}`);
    doc.moveDown();

    doc.text('Entradas:');
    deliveryNote.entries.forEach((entry) => {
      doc.text(` - [${entry.type}] ${entry.description}: ${entry.quantity} ${entry.unit}`);
    });

    if (deliveryNote.signed) {
      doc.moveDown();
      doc.text('FIRMADO', { align: 'right', underline: true });
    }

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = { generateDeliveryNotePdf };
