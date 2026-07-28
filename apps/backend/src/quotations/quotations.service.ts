import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateQuotationDto, UpdateQuotationDto } from "../shared";
import { QuotationStatus } from "@prisma/client";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { Writable } from "stream";
import { ensureFontsExist, prepareArabicText, drawPdfHeader, drawPdfFooter, drawBase64Image } from "../utils/pdf-helpers";

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // 1. Find all quotations
  async findAll() {
    return this.prisma.quotation.findMany({
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Find one quotation
  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });

    if (!quotation) {
      throw new NotFoundException("عرض السعر غير موجود");
    }

    return quotation;
  }

  // 3. Create Quotation
  async create(dto: CreateQuotationDto, user: any) {
    // Generate unique quotation number: QT-YYYY-XXXX
    const count = await this.prisma.quotation.count();
    const dateObj = new Date(dto.date);
    const year = dateObj.getFullYear();
    const seq = String(count + 1).padStart(3, "0");
    const number = `QT-${year}-${seq}`;

    // Calculate totals
    const subtotal = dto.items.reduce((acc, it) => acc + (it.qty * it.price), 0);
    const vat = Math.round(subtotal * (dto.taxPercent / 100));
    const value = subtotal + vat;

    const quotation = await this.prisma.quotation.create({
      data: {
        number,
        clientId: dto.clientId,
        date: new Date(dto.date),
        validUntil: new Date(dto.validUntil),
        status: QuotationStatus.DRAFT,
        taxPercent: dto.taxPercent,
        value,
        currency: dto.currency,
        notes: dto.notes,
        items: {
          create: dto.items.map((it) => ({
            name: it.name,
            brand: it.brand,
            qty: it.qty,
            price: it.price,
            total: it.qty * it.price,
          })),
        },
      },
      include: { items: true },
    });

    await this.auditService.log(user.sub, "CREATE", "Quotation", quotation.id, null, quotation);
    return quotation;
  }

  // 4. Update status
  async updateStatus(id: string, status: QuotationStatus, user: any) {
    const oldQ = await this.findOne(id);

    // بعد التعميد لا يتغير وضع العرض إلا بواسطة الأدمن
    if (oldQ.status === "APPROVED" && user.role !== "ADMIN") {
      throw new ForbiddenException("عرض السعر معتمد ولا يمكن تغيير حالته إلا بواسطة الإدارة");
    }

    const updatedQ = await this.prisma.quotation.update({
      where: { id },
      data: { status },
    });

    await this.auditService.log(user.sub, "UPDATE", "Quotation", id, oldQ, updatedQ);
    return updatedQ;
  }

  // 4.5. Update Quotation details
  async update(id: string, dto: UpdateQuotationDto, user: any) {
    const oldQ = await this.findOne(id);

    // القاعدة: يُعدَّل عرض السعر قبل التعميد فقط — بعد الاعتماد يُقفل (باستثناء الأدمن)
    if (oldQ.status === "APPROVED" && user.role !== "ADMIN") {
      throw new ForbiddenException("لا يمكن تعديل عرض سعر معتمد");
    }

    let value: any = oldQ.value;
    const taxPercent = dto.taxPercent !== undefined ? dto.taxPercent : Number(oldQ.taxPercent);
    if (dto.items) {
      const subtotal = dto.items.reduce((acc, it) => acc + (Number(it.qty) * Number(it.price)), 0);
      const vat = Math.round(subtotal * (taxPercent / 100));
      value = subtotal + vat;
    } else if (dto.taxPercent !== undefined) {
      const subtotal = oldQ.items.reduce((acc, it) => acc + (Number(it.qty) * Number(it.price)), 0);
      const vat = Math.round(subtotal * (taxPercent / 100));
      value = subtotal + vat;
    }

    const updatedQ = await this.prisma.quotation.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        date: dto.date ? new Date(dto.date) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        taxPercent: dto.taxPercent,
        value,
        currency: dto.currency,
        notes: dto.notes,
        items: dto.items ? {
          deleteMany: {},
          create: dto.items.map((it) => ({
            name: it.name,
            brand: it.brand,
            qty: Number(it.qty),
            price: Number(it.price),
            total: Number(it.qty) * Number(it.price),
          })),
        } : undefined,
      },
      include: { items: true },
    });

    await this.auditService.log(user.sub, "UPDATE", "Quotation", id, oldQ, updatedQ);
    return updatedQ;
  }

  // 5. Delete quotation
  async delete(id: string, user: any) {
    const oldQ = await this.findOne(id);
    await this.prisma.quotation.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Quotation", id, oldQ, null);
    return { ok: true };
  }

  // 6. Generate PDF Buffer
  async generatePdf(id: string, query?: any): Promise<Buffer> {
    const q = await this.findOne(id);
    
    // Download and locate fonts
    const fontPaths = await ensureFontsExist();
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err: Error) => reject(err));
 
      // Register Arabic fonts
      doc.registerFont("Amiri", fontPaths.regular);
      doc.registerFont("Cairo-Bold", fontPaths.bold);

      // Draw official header
      drawPdfHeader(doc, "عرض سعر (Quotation)", query);

      // Meta Info Block
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(10);
      doc.text(prepareArabicText("معلومات العرض:"), 40, 142, { align: "right", width: 250 });
      doc.fillColor("#475569").font("Amiri").fontSize(9);
      doc.text(prepareArabicText(`رقم العرض: ${q.number}`), 40, 158, { align: "right", width: 250 });
      doc.text(prepareArabicText(`التاريخ: ${q.date.toISOString().slice(0, 10)}`), 40, 171, { align: "right", width: 250 });
      doc.text(prepareArabicText(`صالح لغاية: ${q.validUntil.toISOString().slice(0, 10)}`), 40, 184, { align: "right", width: 250 });

      // Client info opposite
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(10);
      doc.text("Client / Customer:", 320, 142, { align: "left", width: 250 });
      doc.fillColor("#475569").font("Amiri").fontSize(9);
      doc.text(prepareArabicText(`العميل: ${q.client.name}`), 320, 158, { align: "left", width: 250 });
      doc.text(`Email/Tel: ${q.client.phone || "—"}`, 320, 171, { align: "left", width: 250 });
      doc.text(prepareArabicText(`المدينة: ${q.client.city || "الرياض"}`), 320, 184, { align: "left", width: 250 });

      let y = 210;
      
      // Draw Table Headers
      doc.rect(40, y, 532, 20).fill("#f1f5f9");
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(8.5);
      doc.text(prepareArabicText("الرقم"), 40, y + 5, { width: 30, align: "center" });
      doc.text(prepareArabicText("الصنف والمواد"), 70, y + 5, { width: 180, align: "right" });
      doc.text(prepareArabicText("الوصف/الماركة"), 250, y + 5, { width: 100, align: "right" });
      doc.text(prepareArabicText("الكمية"), 350, y + 5, { width: 40, align: "center" });
      doc.text(prepareArabicText("السعر"), 390, y + 5, { width: 80, align: "left" });
      doc.text(prepareArabicText("الإجمالي"), 470, y + 5, { width: 102, align: "left" });

      y += 20;
      doc.font("Amiri").fontSize(9).fillColor("#0f172a");

      let subtotal = 0;
      q.items.forEach((item, idx) => {
        const itemTotal = Number(item.total);
        subtotal += itemTotal;
        
        // Draw row background for alternating rows
        if (idx % 2 === 1) {
          doc.rect(40, y, 532, 20).fill("#f8fafc");
          doc.fillColor("#0f172a");
        }
        
        // Draw text
        doc.text(`${idx + 1}`, 40, y + 5, { width: 30, align: "center" });
        doc.text(prepareArabicText(item.name), 70, y + 5, { width: 180, align: "right" });
        doc.text(prepareArabicText(item.brand || "—"), 250, y + 5, { width: 100, align: "right" });
        doc.text(`${item.qty}`, 350, y + 5, { width: 40, align: "center" });
        doc.text(`${Number(item.price).toFixed(2)}`, 390, y + 5, { width: 80, align: "left" });
        doc.text(`${itemTotal.toFixed(2)}`, 470, y + 5, { width: 102, align: "left" });

        // Draw thin bottom border
        doc.moveTo(40, y + 20).lineTo(572, y + 20).strokeColor("#e2e8f0").lineWidth(0.5).stroke();
        y += 20;

        // Page break check if y goes near bottom
        if (y > 640) {
          drawPdfFooter(doc, 1, query);
          doc.addPage();
          drawPdfHeader(doc, "عرض سعر (Quotation)", query);
          y = 140;
          
          // Redraw table headers on new page
          doc.rect(40, y, 532, 20).fill("#f1f5f9");
          doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(8.5);
          doc.text(prepareArabicText("الرقم"), 40, y + 5, { width: 30, align: "center" });
          doc.text(prepareArabicText("الصنف والمواد"), 70, y + 5, { width: 180, align: "right" });
          doc.text(prepareArabicText("الوصف/الماركة"), 250, y + 5, { width: 100, align: "right" });
          doc.text(prepareArabicText("الكمية"), 350, y + 5, { width: 40, align: "center" });
          doc.text(prepareArabicText("السعر"), 390, y + 5, { width: 80, align: "left" });
          doc.text(prepareArabicText("الإجمالي"), 470, y + 5, { width: 102, align: "left" });
          y += 20;
          doc.font("Amiri").fontSize(9).fillColor("#0f172a");
        }
      });

      y += 10;
      const taxAmount = subtotal * (Number(q.taxPercent) / 100);
      const finalTotal = subtotal + taxAmount;

      // Totals Box
      doc.rect(370, y, 202, 60).fill("#f8fafc");
      doc.rect(370, y, 202, 60).strokeColor("#cbd5e1").lineWidth(1).stroke();
      
      doc.fillColor("#475569").font("Cairo-Bold").fontSize(8);
      doc.text(prepareArabicText(`المجموع الفرعي: ${subtotal.toFixed(2)} ${q.currency}`), 380, y + 6, { align: "right", width: 182 });
      doc.text(prepareArabicText(`الضريبة (${q.taxPercent}%): ${taxAmount.toFixed(2)} ${q.currency}`), 380, y + 22, { align: "right", width: 182 });
      doc.fillColor("#e11d48").fontSize(9);
      doc.text(prepareArabicText(`الإجمالي شامل الضريبة: ${finalTotal.toFixed(2)} ${q.currency}`), 380, y + 40, { align: "right", width: 182 });

      y += 80;
      
      // Notes
      if (q.notes) {
        doc.fillColor("#0f172a").font("Cairo-Bold").fontSize(9).text(prepareArabicText("ملاحظات إضافية:"), 40, y, { align: "right" });
        doc.font("Amiri").fontSize(8.5).text(prepareArabicText(q.notes), 40, y + 14, { align: "right", width: 532 });
        y += 40;
      }
      
      // Note: Signatures and Client Approval section removed per user requirement.
      if (query?.stamp) {
        drawBase64Image(doc, query.stamp, 180, y, { height: 50 });
      }
      if (query?.signature) {
        drawBase64Image(doc, query.signature, 80, y, { height: 40 });
      }

      // Draw footer on all pages
      let pages = (doc as any)._pageBuffer || [];
      for (let i = 0; i < pages.length; i++) {
        doc.switchToPage(i);
        drawPdfFooter(doc, i + 1, query);
      }
      
      doc.end();
    });
  }

  // 7. Generate Excel Buffer
  async generateExcel(id: string): Promise<Buffer> {
    const q = await this.findOne(id);

    const rows = q.items.map((item, idx) => ({
      "م.": idx + 1,
      "الصنف": item.name,
      "الوصف": item.brand || "—",
      "الكمية": Number(item.qty),
      "السعر": Number(item.price),
      "الإجمالي": Number(item.total),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation Items");

    // Add totals rows
    const subtotal = q.items.reduce((acc, it) => acc + Number(it.total), 0);
    const vat = subtotal * (Number(q.taxPercent) / 100);
    const total = subtotal + vat;

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [],
        ["", "", "", "", "المجموع الفرعي", subtotal],
        ["", "", "", "", `الضريبة (${q.taxPercent}%)`, vat],
        ["", "", "", "", "الإجمالي النهائي", total],
      ],
      { origin: -1 }
    );

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer as Buffer;
  }
}
