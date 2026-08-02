const { drawPdfHeader, drawPdfFooter, prepareArabicText, ensureFontsExist } = require('../apps/backend/dist/utils/pdf-helpers');
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function runTest() {
  console.log("🛠️ تشغيل اختبار تصدير الـ PDF بالهيدر والفوتر الجديدين...");
  
  const fontPaths = await ensureFontsExist();
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const stream = fs.createWriteStream('./test_quote_bg.pdf');
  doc.pipe(stream);

  doc.registerFont('Amiri', fontPaths.regular);
  doc.registerFont('Cairo-Bold', fontPaths.bold);

  // 1. رسم الهيدر والقالب الثابت
  drawPdfHeader(doc, 'عرض سعر (Quotation)', {});

  // 2. معلومات العرض والعميل
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(10);
  doc.text(prepareArabicText('معلومات العرض:'), 300, 150, { align: 'right', width: 255 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('رقم العرض: QUO-2026-009'), 300, 166, { align: 'right', width: 255 });
  doc.text(prepareArabicText('التاريخ: 2026-07-30'), 300, 179, { align: 'right', width: 255 });
  doc.text(prepareArabicText('صالح لغاية: 2026-08-30'), 300, 192, { align: 'right', width: 255 });

  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(10);
  doc.text(prepareArabicText('معلومات العميل / Client:'), 40, 150, { align: 'left', width: 250 });
  doc.fillColor('#475569').font('Amiri').fontSize(9);
  doc.text(prepareArabicText('العميل: شركة الأمل للمقاولات والمشاريع'), 40, 166, { align: 'left', width: 250 });
  doc.text('Email/Tel: info@alamal.sa / +966551234567', 40, 179, { align: 'left', width: 250 });
  doc.text(prepareArabicText('المدينة: الرياض - المملكة العربية السعودية'), 40, 192, { align: 'left', width: 250 });

  // 3. جدول الأصناف
  let y = 218;
  doc.rect(40, y, 515.28, 20).fill('#f1f5f9');
  doc.fillColor('#0d1440').font('Cairo-Bold').fontSize(8.5);
  doc.text(prepareArabicText('الرقم'), 40, y + 5, { width: 30, align: 'center' });
  doc.text(prepareArabicText('الصنف والمواد'), 70, y + 5, { width: 180, align: 'right' });
  doc.text(prepareArabicText('الوصف/الماركة'), 250, y + 5, { width: 105, align: 'right' });
  doc.text(prepareArabicText('الكمية'), 355, y + 5, { width: 40, align: 'center' });
  doc.text(prepareArabicText('السعر'), 395, y + 5, { width: 75, align: 'left' });
  doc.text(prepareArabicText('الإجمالي'), 470, y + 5, { width: 85, align: 'left' });

  const items = [
    { name: 'مضخة إطفاء حريق رئيسية 500 GPM', brand: 'UL/FM Listed', qty: 1, price: 25000 },
    { name: 'لوحة تحكم مضخة الحريق الرقمية', brand: 'Tornatech', qty: 1, price: 12000 },
    { name: 'صمامات ومحابس تخفيض الضغط 4 انش', brand: 'Viking USA', qty: 4, price: 1800 },
    { name: 'صندوق إطفاء حريق حائطي بالخرطوم', brand: 'NAFFCO', qty: 10, price: 950 }
  ];

  y += 20;
  doc.font('Amiri').fontSize(9).fillColor('#0f172a');
  let subtotal = 0;

  items.forEach((item, idx) => {
    const total = item.qty * item.price;
    subtotal += total;

    if (idx % 2 === 1) {
      doc.rect(40, y, 515.28, 20).fill('#f8fafc');
      doc.fillColor('#0f172a');
    }

    doc.text(`${idx + 1}`, 40, y + 5, { width: 30, align: 'center' });
    doc.text(prepareArabicText(item.name), 70, y + 5, { width: 180, align: 'right' });
    doc.text(prepareArabicText(item.brand), 250, y + 5, { width: 105, align: 'right' });
    doc.text(`${item.qty}`, 355, y + 5, { width: 40, align: 'center' });
    doc.text(`${item.price.toFixed(2)}`, 395, y + 5, { width: 75, align: 'left' });
    doc.text(`${total.toFixed(2)}`, 470, y + 5, { width: 85, align: 'left' });

    doc.moveTo(40, y + 20).lineTo(555.28, y + 20).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    y += 20;
  });

  // 4. صندوق المجاميع
  y += 15;
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;

  doc.rect(355, y, 200, 60).fill('#f8fafc');
  doc.rect(355, y, 200, 60).strokeColor('#cbd5e1').lineWidth(1).stroke();
  
  doc.fillColor('#475569').font('Cairo-Bold').fontSize(8);
  doc.text(prepareArabicText(`المجموع الفرعي: ${subtotal.toFixed(2)} ر.س`), 365, y + 6, { align: 'right', width: 180 });
  doc.text(prepareArabicText(`الضريبة (15%): ${tax.toFixed(2)} ر.س`), 365, y + 22, { align: 'right', width: 180 });
  doc.fillColor('#e11d48').fontSize(9);
  doc.text(prepareArabicText(`الإجمالي شامل الضريبة: ${grandTotal.toFixed(2)} ر.س`), 365, y + 40, { align: 'right', width: 180 });

  // 5. الملاحظات
  y += 75;
  doc.fillColor('#0f172a').font('Cairo-Bold').fontSize(9).text(prepareArabicText('الشروط والملاحظات:'), 40, y, { align: 'right' });
  doc.font('Amiri').fontSize(8.5).text(prepareArabicText('• هذا العرض ساري لمدة 30 يوماً من تاريخ الإصدار.\n• التوريد والتركيب يتم وفقاً لمعايير الدفاع المدني واشتراطات الكود السعودي.'), 40, y + 14, { align: 'right', width: 515.28 });

  // 6. الفوتر لجميع الصفحات
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawPdfFooter(doc, i + 1, range.count, {});
  }

  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));
  console.log('✅ تم إنشاء ملف الـ PDF بنجاح!');
}

runTest();
