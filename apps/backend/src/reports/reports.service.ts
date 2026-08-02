import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { ensureFontsExist, prepareArabicText, drawPdfHeader, drawPdfFooter } from "../utils/pdf-helpers";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Get Project Report Data
  async getProjectReport(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        engineer: { select: { name: true, email: true } },
        stages: true,
        assignments: {
          include: { worker: true, contractor: true },
        },
        invoices: true,
        expenses: true,
      },
    });

    if (!project) {
      throw new NotFoundException("المشروع غير موجود");
    }

    const totalInvoiced = project.invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalExpenses = project.expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
    const projectProfit = totalInvoiced - totalExpenses;

    return {
      project,
      summary: {
        totalInvoiced,
        totalExpenses,
        projectProfit,
      },
    };
  }

  // 2. Get Financial Report Data
  async getFinancialReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const invoices = await this.prisma.invoice.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { project: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { project: true },
    });

    const totalIncome = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalExpense = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
    const netProfit = totalIncome - totalExpense;

    return {
      period: { start, end },
      totalIncome,
      totalExpense,
      netProfit,
      invoices,
      expenses,
    };
  }

  // 3. Generate Project Report PDF Buffer
  async generateProjectPdf(projectId: string, query?: any): Promise<Buffer> {
    const data = await this.getProjectReport(projectId);
    const { project, summary } = data;
    
    // Download and locate fonts
    const fontPaths = await ensureFontsExist();
 
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, bufferPages: true });
      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err: Error) => reject(err));
 
      // Register Arabic fonts
      doc.registerFont("Amiri", fontPaths.regular);
      doc.registerFont("Cairo-Bold", fontPaths.bold);
 
      // Draw official header
      drawPdfHeader(doc, "تقرير كشف المتابعة الفنية للمشروع", query);
 
      // Project Info Block
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(10);
      doc.text(prepareArabicText("معلومات المشروع:"), 300, 150, { align: "right", width: 255 });
      doc.fillColor("#475569").font("Amiri").fontSize(9);
      doc.text(prepareArabicText(`اسم المشروع: ${project.name}`), 300, 166, { align: "right", width: 255 });
      doc.text(prepareArabicText(`المشرف: ${project.engineer?.name || "غير معيّن"}`), 300, 179, { align: "right", width: 255 });
      doc.text(prepareArabicText(`حالة المشروع: ${project.status}`), 300, 192, { align: "right", width: 255 });
      doc.text(prepareArabicText(`التقدم الفعلي: ${project.progress}%`), 300, 205, { align: "right", width: 255 });
 
      // Timeline info opposite
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(10);
      doc.text("Project Timeline:", 40, 150, { align: "left", width: 250 });
      doc.fillColor("#475569").font("Amiri").fontSize(9);
      doc.text(`Start Date: ${project.startDate.toISOString().slice(0, 10)}`, 40, 166, { align: "left", width: 250 });
      doc.text(`End Date: ${project.endDate.toISOString().slice(0, 10)}`, 40, 179, { align: "left", width: 250 });
      doc.text(prepareArabicText(`نوع الأعمال: ${project.type}`), 40, 192, { align: "left", width: 250 });
 
      let y = 228;
      
      // Financial Summary Box
      doc.rect(40, y, 515.28, 20).fill("#f1f5f9");
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(9.5);
      doc.text(prepareArabicText("الخلاصة المالية للموقع:"), 40, y + 4, { align: "right", width: 505 });
      
      y += 24;
      doc.font("Amiri").fontSize(9).fillColor("#0f172a");
      doc.text(prepareArabicText(`قيمة العقد الإجمالية (الموازنة): ${project.budget} ر.س`), 40, y, { align: "right", width: 505 });
      doc.text(prepareArabicText(`إجمالي المبالغ المفوترة (الإيرادات): ${summary.totalInvoiced} ر.س`), 40, y + 15, { align: "right", width: 505 });
      doc.text(prepareArabicText(`إجمالي التكاليف والمصروفات: ${summary.totalExpenses} ر.س`), 40, y + 30, { align: "right", width: 505 });
      doc.fillColor("#10b981").font("Cairo-Bold");
      doc.text(prepareArabicText(`صافي الربح التشغيلي للمشروع: ${summary.projectProfit} ر.س`), 40, y + 48, { align: "right", width: 505 });
 
      y += 75;
      
      // Assigned Workers Box
      doc.rect(40, y, 515.28, 20).fill("#f1f5f9");
      doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(9.5);
      doc.text(prepareArabicText("الكادر الفني والعمالة المعينة بالموقع:"), 40, y + 4, { align: "right", width: 505 });
      
      y += 24;
      doc.font("Amiri").fontSize(9).fillColor("#0f172a");
      if (project.assignments.length === 0) {
        doc.text(prepareArabicText("لا يوجد كادر فني معين بالموقع حالياً."), 40, y, { align: "right", width: 505 });
      } else {
        project.assignments.forEach((a, idx) => {
          const entityName = a.worker
            ? `موظف: ${a.worker.name} (${a.worker.specialty})`
            : `مقاول باطن: ${a.contractor?.name} (${a.contractor?.specialty})`;
          doc.text(prepareArabicText(`${idx + 1}. ${entityName} — الدور بالموقع: ${a.roleOnSite}`), 40, y, { align: "right", width: 505 });
          y += 16;
        });
      }
 
      // Draw footer on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawPdfFooter(doc, i + 1, range.count, query);
      }
 
      doc.end();
    });
  }

  // 4. Generate Project Report Excel Buffer
  async generateProjectExcel(projectId: string): Promise<Buffer> {
    const data = await this.getProjectReport(projectId);
    const { project } = data;

    const rows = [
      ["Project Name", project.name],
      ["Type", project.type],
      ["Status", project.status],
      ["Progress", `${project.progress}%`],
      ["Budget", Number(project.budget)],
      [],
      ["Financial Report"],
      ["Total Invoiced", data.summary.totalInvoiced],
      ["Total Expenses", data.summary.totalExpenses],
      ["Profit", data.summary.projectProfit],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Report");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer as Buffer;
  }
}
