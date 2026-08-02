import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generateClientQuotationPdf(quotation: any, siteInfo: any) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "816px"; // 216 mm at 96 DPI
  container.style.minHeight = "1054px"; // 279 mm at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.fontFamily = "'Cairo', 'Segoe UI', Arial, sans-serif";
  container.style.direction = "rtl";

  const number = quotation.number || quotation.id || "Q-001";
  const date = quotation.date ? quotation.date.toString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const validUntil = quotation.validUntil ? quotation.validUntil.toString().slice(0, 10) : "—";
  const clientName = quotation.clientName || quotation.client?.name || "عميل محترم";
  const clientPhone = quotation.clientPhone || quotation.client?.phone || "—";
  const clientCity = quotation.clientCity || quotation.client?.city || "الرياض";
  const currency = quotation.currency || "ر.س";

  const items = quotation.items || [];
  let subtotal = 0;
  items.forEach((it: any) => {
    subtotal += Number(it.total || (Number(it.qty || 1) * Number(it.price || 0)));
  });

  const taxPercent = quotation.taxPercent !== undefined ? Number(quotation.taxPercent) : 15;
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = subtotal + taxAmount;

  container.innerHTML = `
    <div style="position: relative; width: 816px; min-height: 1054px; box-sizing: border-box; overflow: hidden; background: white; color: #000000;">
      <!-- Letterhead Background Template (Doc1.pdf) -->
      <img src="/letterhead_bg.png" style="position: absolute; top: 0; left: 0; width: 816px; height: 1054px; object-fit: fill; z-index: 1;" alt="Letterhead" />

      <!-- Document Content -->
      <div style="position: relative; z-index: 10; padding: 155px 45px 80px 45px; box-sizing: border-box; color: #000000;">
        
        <!-- Header Info Block -->
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 6px 26px; background: #d91c24; color: #ffffff; font-weight: 800; font-size: 16px; border-radius: 6px; box-shadow: 0 2px 4px rgba(217, 28, 36, 0.2);">
            عرض سعر (Quotation)
          </span>
        </div>

        <!-- Info Grid -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 14px; border: 1.5px solid #000000; color: #000000;">
          <div style="width: 48%; font-size: 13px; line-height: 1.8; color: #000000;">
            <div style="color: #000000; font-weight: 800; font-size: 14px; margin-bottom: 6px;">معلومات العرض:</div>
            <div style="color: #000000;"><strong style="color: #000000;">رقم العرض:</strong> ${number}</div>
            <div style="color: #000000;"><strong style="color: #000000;">التاريخ:</strong> ${date}</div>
            <div style="color: #000000;"><strong style="color: #000000;">صالح لغاية:</strong> ${validUntil}</div>
          </div>
          <div style="width: 48%; font-size: 13px; line-height: 1.8; color: #000000;">
            <div style="color: #000000; font-weight: 800; font-size: 14px; margin-bottom: 6px;">معلومات العميل:</div>
            <div style="color: #000000;"><strong style="color: #000000;">اسم العميل:</strong> ${clientName}</div>
            <div style="color: #000000;"><strong style="color: #000000;">الجوال/الهاتف:</strong> ${clientPhone}</div>
            <div style="color: #000000;"><strong style="color: #000000;">المدينة:</strong> ${clientCity}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; color: #000000;">
          <thead>
            <tr style="background-color: #0d1440; color: #ffffff;">
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #0d1440; width: 40px; color: #ffffff;">#</th>
              <th style="padding: 10px 8px; text-align: right; border: 1px solid #0d1440; color: #ffffff;">الصنف / البيان</th>
              <th style="padding: 10px 8px; text-align: right; border: 1px solid #0d1440; width: 120px; color: #ffffff;">الوصف / الماركة</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #0d1440; width: 50px; color: #ffffff;">الكمية</th>
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #0d1440; width: 80px; color: #ffffff;">السعر</th>
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #0d1440; width: 90px; color: #ffffff;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 15px; text-align: center; color: #000000; border: 1px solid #000000;">لا يوجد بنود مسجلة في هذا العرض</td>
              </tr>
            ` : items.map((it: any, idx: number) => {
              const bg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
              const p = Number(it.price || 0).toFixed(2);
              const t = Number(it.total || (Number(it.qty || 1) * Number(it.price || 0))).toFixed(2);
              return `
                <tr style="background-color: ${bg}; border-bottom: 1px solid #000000; color: #000000;">
                  <td style="padding: 8px; text-align: center; border: 1px solid #000000; color: #000000;">${idx + 1}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #000000; font-weight: 700; color: #000000;">${it.name || "—"}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #000000; color: #000000;">${it.brand || it.description || "—"}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #000000; color: #000000; font-weight: 700;">${it.qty || 1}</td>
                  <td style="padding: 8px; text-align: left; border: 1px solid #000000; color: #000000;">${p}</td>
                  <td style="padding: 8px; text-align: left; border: 1px solid #000000; font-weight: 800; color: #000000;">${t}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <!-- Totals Block -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 250px; background: #ffffff; border: 1.5px solid #000000; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.8; color: #000000;">
            <div style="display: flex; justify-content: space-between; color: #000000;">
              <span style="color: #000000;">المجموع الفرعي:</span>
              <strong style="color: #000000;">${subtotal.toFixed(2)} ${currency}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #000000;">
              <span style="color: #000000;">ضريبة القيمة المضافة (${taxPercent}%):</span>
              <strong style="color: #000000;">${taxAmount.toFixed(2)} ${currency}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #000000; font-size: 15px; font-weight: 800; border-top: 1.5px solid #000000; margin-top: 6px; padding-top: 6px;">
              <span style="color: #000000;">الإجمالي النهائي:</span>
              <span style="color: #000000;">${grandTotal.toFixed(2)} ${currency}</span>
            </div>
          </div>
        </div>

        <!-- Notes & Signature Block -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; font-size: 12px; color: #000000;">
          <div style="width: 60%; color: #000000;">
            <div style="font-weight: 800; color: #000000; margin-bottom: 4px;">الشروط والأحكام:</div>
            <div style="color: #000000;">- هذا العرض موثق رسمياً وصالح لغاية المدة الموضحة أعلاه.</div>
            <div style="color: #000000;">- الأسعار شاملة التركيب وضمان المكونات طبقاً لمعايير الدفاع المدني.</div>
          </div>
          <div style="text-align: center; width: 35%; color: #000000;">
            <div style="font-weight: 800; color: #000000; margin-bottom: 10px;">التوقيع والختم الرسمي</div>
            ${siteInfo?.stamp ? `<img src="${siteInfo.stamp}" style="max-height: 70px; max-width: 130px; object-fit: contain;" />` : `<div style="height: 60px; border: 1px dashed #000000; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 700;">شركة كنان للأمن والسلامة</div>`}
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 4, // 4x Lossless Super High Definition (3264px x 4216px!)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png"); // Lossless PNG (Zero compression quality loss!)
    const pdf = new jsPDF("p", "mm", [216, 279]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${number}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateClientProjectReportPdf(project: any, siteInfo: any) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "816px";
  container.style.minHeight = "1054px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.fontFamily = "'Cairo', 'Segoe UI', Arial, sans-serif";
  container.style.direction = "rtl";

  const projectName = project.name || "مشروع بدون عنوان";
  const clientName = project.client || project.clientName || "—";
  const location = project.location || "الرياض";
  const status = project.status || "قيد التنفيذ";
  const progress = project.progress || 0;
  const contractValue = Number(project.contractValue || 0).toLocaleString();

  container.innerHTML = `
    <div style="position: relative; width: 816px; min-height: 1054px; box-sizing: border-box; overflow: hidden; background: white; color: #000000;">
      <!-- Letterhead Background Template (Doc1.pdf) -->
      <img src="/letterhead_bg.png" style="position: absolute; top: 0; left: 0; width: 816px; height: 1054px; object-fit: fill; z-index: 1;" alt="Letterhead" />

      <!-- Document Content -->
      <div style="position: relative; z-index: 10; padding: 155px 45px 80px 45px; box-sizing: border-box; color: #000000;">
        
        <!-- Header Badge -->
        <div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 10px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 22px; color: #000000; font-weight: 800;">تقرير تفصيلي للمشروع</h1>
          <div style="font-size: 14px; color: #000000; margin-top: 4px; font-weight: 700;">${projectName}</div>
        </div>

        <!-- Info Grid -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 14px; border: 1.5px solid #000000; color: #000000;">
          <div style="width: 48%; font-size: 13px; line-height: 1.8; color: #000000;">
            <div style="color: #000000;"><strong style="color: #000000;">اسم المشروع:</strong> ${projectName}</div>
            <div style="color: #000000;"><strong style="color: #000000;">العميل:</strong> ${clientName}</div>
            <div style="color: #000000;"><strong style="color: #000000;">الموقع:</strong> ${location}</div>
          </div>
          <div style="width: 48%; font-size: 13px; line-height: 1.8; color: #000000;">
            <div style="color: #000000;"><strong style="color: #000000;">الحالة الحالية:</strong> ${status}</div>
            <div style="color: #000000;"><strong style="color: #000000;">نسبة الإنجاز:</strong> ${progress}%</div>
            <div style="color: #000000;"><strong style="color: #000000;">قيمة العقد:</strong> ${contractValue} ر.س</div>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div style="margin-bottom: 30px; background: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px solid #000000; color: #000000;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 800; color: #000000; margin-bottom: 8px;">
            <span style="color: #000000;">تقدم سير العمل الإجمالي</span>
            <span style="color: #000000;">${progress}%</span>
          </div>
          <div style="width: 100%; height: 12px; background: #cbd5e1; border-radius: 6px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 6px;"></div>
          </div>
        </div>

        <!-- Stamp & Signature Block -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; font-size: 12px; color: #000000;">
          <div style="width: 60%; color: #000000;">
            <div style="font-weight: 800; color: #000000; margin-bottom: 4px;">ملاحظات الإدارة الفنية:</div>
            <div style="color: #000000;">تم إصدار هذا التقرير آلياً بناءً على السجلات المعتمدة للمشروع في نظام كنان.</div>
          </div>
          <div style="text-align: center; width: 35%; color: #000000;">
            <div style="font-weight: 800; color: #000000; margin-bottom: 10px;">التوقيع والختم الرسمي</div>
            ${siteInfo?.stamp ? `<img src="${siteInfo.stamp}" style="max-height: 70px; max-width: 130px; object-fit: contain;" />` : `<div style="height: 60px; border: 1px dashed #000000; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 700;">شركة كنان للأمن والسلامة</div>`}
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 4, // 4x Lossless Super High Definition (3264px x 4216px!)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png"); // Lossless PNG
    const pdf = new jsPDF("p", "mm", [216, 279]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`تقرير_${projectName}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
