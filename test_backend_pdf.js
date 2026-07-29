const { drawPdfHeader, drawPdfFooter, prepareArabicText, ensureFontsExist } = require('./apps/backend/dist/utils/pdf-helpers');
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function test() {
  const fontPaths = await ensureFontsExist();
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream('./test_quote_bg.pdf');
  doc.pipe(stream);

  doc.registerFont('Amiri', fontPaths.regular);
  doc.registerFont('Cairo-Bold', fontPaths.bold);

  drawPdfHeader(doc, 'عرض سعر (Quotation)', {});

  // Document Info
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(10);
  doc.text(prepareArabicText('معلومات العرض:'), 40, 142, { align: 'right', width: 250 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('رقم العرض: QUO-2026-001'), 40, 158, { align: 'right', width: 250 });
  doc.text(prepareArabicText('التاريخ: 2026-07-30'), 40, 171, { align: 'right', width: 250 });

  // Client info
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(10);
  doc.text('Client / Customer:', 320, 142, { align: 'left', width: 250 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('العميل: شركة الأمل للإنشاءات'), 320, 158, { align: 'left', width: 250 });

  // Table Headers
  let y = 200;
  doc.rect(40, y, 515.28, 20).fill('#f1f5f9');
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(8.5);
  doc.text(prepareArabicText('الرقم'), 40, y + 5, { width: 30, align: 'center' });
  doc.text(prepareArabicText('الصنف والمواد'), 70, y + 5, { width: 180, align: 'right' });
  doc.text(prepareArabicText('الوصف/الماركة'), 250, y + 5, { width: 100, align: 'right' });
  doc.text(prepareArabicText('الكمية'), 350, y + 5, { width: 40, align: 'center' });
  doc.text(prepareArabicText('السعر'), 390, y + 5, { width: 65, align: 'left' });
  doc.text(prepareArabicText('الإجمالي'), 455, y + 5, { width: 100, align: 'left' });

  y += 20;
  doc.font('Amiri').fontSize(9).fillColor('#0f172a');
  doc.text('1', 40, y + 5, { width: 30, align: 'center' });
  doc.text(prepareArabicText('مضخة إطفاء حريق 500 GPM'), 70, y + 5, { width: 180, align: 'right' });
  doc.text(prepareArabicText('UL/FM Listed'), 250, y + 5, { width: 100, align: 'right' });
  doc.text('2', 350, y + 5, { width: 40, align: 'center' });
  doc.text('15000.00', 390, y + 5, { width: 65, align: 'left' });
  doc.text('30000.00', 455, y + 5, { width: 100, align: 'left' });

  drawPdfFooter(doc, 1, {});

  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));
  console.log('Finished writing test_quote_bg.pdf');
}

test();
