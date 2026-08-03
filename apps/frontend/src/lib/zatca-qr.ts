/**
 * رمز QR للفاتورة الضريبية حسب متطلبات هيئة الزكاة والضريبة والجمارك.
 *
 * الترميز TLV: لكل حقل بايت للوسم، وبايت للطول، ثم القيمة بترميز UTF-8،
 * ثم تُحوَّل السلسلة كاملة إلى Base64. الحقول الخمسة الإلزامية بالترتيب:
 *   1) اسم البائع  2) الرقم الضريبي للبائع  3) التاريخ والوقت (ISO 8601)
 *   4) الإجمالي شامل الضريبة  5) قيمة الضريبة
 */

function tlv(tag: number, value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  const out = new Uint8Array(bytes.length + 2);
  out[0] = tag;
  out[1] = bytes.length; // القيم هنا أقصر من 255 بايت دائماً
  out.set(bytes, 2);
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return typeof window === "undefined"
    ? Buffer.from(binary, "binary").toString("base64")
    : window.btoa(binary);
}

export type ZatcaInvoice = {
  sellerName: string;
  sellerTaxNumber: string;
  /** لحظة إصدار الفاتورة */
  issuedAt: Date;
  /** الإجمالي شامل ضريبة القيمة المضافة */
  totalWithVat: number;
  vatAmount: number;
};

export function zatcaQrPayload(invoice: ZatcaInvoice): string {
  const fields = [
    tlv(1, invoice.sellerName),
    tlv(2, invoice.sellerTaxNumber),
    tlv(3, invoice.issuedAt.toISOString()),
    tlv(4, invoice.totalWithVat.toFixed(2)),
    tlv(5, invoice.vatAmount.toFixed(2)),
  ];

  const total = fields.reduce((sum, f) => sum + f.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const f of fields) {
    merged.set(f, offset);
    offset += f.length;
  }

  return toBase64(merged);
}
