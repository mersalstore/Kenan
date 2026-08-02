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
  doc.text(prepareArabicText('معلومات العرض:'), 300, 150, { align: 'right', width: 255 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('رقم العرض: QUO-2026-001'), 300, 166, { align: 'right', width: 255 });
  doc.text(prepareArabicText('التاريخ: 2026-07-30'), 300, 179, { align: 'right', width: 255 });
  doc.text(prepareArabicText('صالح لغاية: 2026-08-30'), 300, 192, { align: 'right', width: 255 });

  // Client info
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(10);
  doc.text(prepareArabicText('معلومات العميل / Client:'), 40, 150, { align: 'left', width: 250 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('العميل: شركة الأمل للإنشاءات'), 40, 166, { align: 'left', width: 250 });
  doc.text('Email/Tel: info@alamal.com / +966501234567', 40, 179, { align: 'left', width: 250 });
  doc.text(prepareArabicText('المدينة: الرياض'), 40, 192, { align: 'left', width: 250 });

  // Table Headers
  let y = 218;
  doc.rect(40, y, 515.28, 20).fill('#f1f5f9');
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(8.5);
  doc.text(prepareArabicText('الرقم'), 40, y + 5, { width: 30, align: 'center' });
  doc.text(prepareArabicText('الصنف والمواد'), 70, y + 5, { width: 180, align: 'right' });
  doc.text(prepareArabicText('الوصف/الماركة'), 250, y + 5, { width: 105, align: 'right' });
  doc.text(prepareArabicText('الكمية'), 355, y + 5, { width: 40, align: 'center' });
  doc.text(prepareArabicText('السعر'), 395, y + 5, { width: 75, align: 'left' });
  doc.text(prepareArabicText('الإجمالي'), 470, y + 5, { width: 85, align: 'left' });

  y += 20;
  doc.font('Amiri').fontSize(9).fillColor('#0f172a');
  doc.text('1', 40, y + 5, { width: 30, align: 'center' });
  doc.text(prepareArabicText('مضخة إطفاء حريق 500 GPM'), 70, y + 5, { width: 180, align: 'right' });
  doc.text(prepareArabicText('UL/FM Listed'), 250, y + 5, { width: 105, align: 'right' });
  doc.text('2', 355, y + 5, { width: 40, align: 'center' });
  doc.text('15000.00', 395, y + 5, { width: 75, align: 'left' });
  doc.text('30000.00', 470, y + 5, { width: 85, align: 'left' });

  doc.moveTo(40, y + 20).lineTo(555.28, y + 20).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

  y += 30;
  // Totals Box
  doc.rect(355, y, 200, 60).fill('#f8fafc');
  doc.rect(355, y, 200, 60).strokeColor('#cbd5e1').lineWidth(1).stroke();
  
  doc.fillColor('#475569').font('Cairo-Bold').fontSize(8);
  doc.text(prepareArabicText('المجموع الفرعي: 30000.00 ر.س'), 365, y + 6, { align: 'right', width: 180 });
  doc.text(prepareArabicText('الضريبة (15%): 4500.00 ر.س'), 365, y + 22, { align: 'right', width: 180 });
  doc.fillColor('#e11d48').fontSize(9);
  doc.text(prepareArabicText('الإجمالي شامل الضريبة: 34500.00 ر.س'), 365, y + 40, { align: 'right', width: 180 });

  drawPdfFooter(doc, 1, {});

  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));
  console.log('Finished writing test_quote_bg.pdf');
}

test();

