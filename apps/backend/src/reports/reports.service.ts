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
    const trimmed = String(projectId || "").trim();
    let project = await this.prisma.project.findUnique({
      where: { id: trimmed },
      include: {
        client: true,
        engineer: { select: { name: true, email: true } },
        stages: true,
        assignments: {
          include: { worker: true, contractor: true },
        },
        invoices: true,
        expenses: true,
      },
    }).catch(() => null);

    if (!project) {
      project = await this.prisma.project.findFirst({
        where: {
          OR: [
            { name: trimmed },
            { name: { contains: trimmed } },
          ],
        },
        include: {
          client: true,
          engineer: { select: { name: true, email: true } },
          stages: true,
          assignments: {
            include: { worker: true, contractor: true },
          },
          invoices: true,
          expenses: true,
        },
      }).catch(() => null);
    }

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

  // 4. Generate Project Statement Excel Buffer (كشف حساب المشروع)
  async generateProjectExcel(
    projectId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    const data = await this.getProjectReport(projectId);
    const { project } = data;

    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
    const withinRange = (date: Date) => (!from || date >= from) && (!to || date <= to);

    // حركات الفواتير (دائن) والمصروفات (مدين) مرتبة زمنياً لبناء رصيد تراكمي
    const movements = [
      ...project.invoices
        .map((inv) => ({
          date: inv.issueDate ?? inv.createdAt,
          kind: "فاتورة",
          reference: inv.number,
          statement: `فاتورة على المشروع — الحالة: ${inv.status}`,
          credit: Number(inv.amount),
          debit: 0,
        }))
        .filter((row) => withinRange(row.date)),
      ...project.expenses
        .map((exp) => ({
          date: exp.date,
          kind: "مصروف",
          reference: exp.type,
          statement: exp.description ?? "",
          credit: 0,
          debit: Number(exp.amount),
        }))
        .filter((row) => withinRange(row.date)),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const invoicedInRange = movements.reduce((sum, row) => sum + row.credit, 0);
    const spentInRange = movements.reduce((sum, row) => sum + row.debit, 0);

    const day = (value: Date) => value.toISOString().slice(0, 10);

    const summaryRows: (string | number)[][] = [
      ["كشف حساب المشروع"],
      [],
      ["اسم المشروع", project.name],
      ["العميل", project.client?.name ?? "—"],
      ["نوع الأعمال", project.type],
      ["المهندس المشرف", project.engineer?.name ?? "غير معيّن"],
      ["حالة المشروع", project.status],
      ["نسبة الإنجاز", `${project.progress}%`],
      ["تاريخ البدء", day(project.startDate)],
      ["تاريخ الانتهاء", day(project.endDate)],
      ["قيمة العقد (الموازنة)", Number(project.budget)],
      [],
      ["فترة الكشف", from || to ? `${startDate ?? "البداية"} إلى ${endDate ?? "اليوم"}` : "كل الفترات"],
      ["إجمالي المفوتر (دائن)", invoicedInRange],
      ["إجمالي المصروفات (مدين)", spentInRange],
      ["صافي الربح", invoicedInRange - spentInRange],
      ["المتبقي من قيمة العقد", Number(project.budget) - invoicedInRange],
    ];

    let balance = 0;
    const ledgerRows: (string | number)[][] = [
      ["التاريخ", "النوع", "المرجع", "البيان", "مدين (مصروف)", "دائن (فاتورة)", "الرصيد"],
      ...movements.map((row) => {
        balance += row.credit - row.debit;
        return [day(row.date), row.kind, row.reference, row.statement, row.debit, row.credit, balance];
      }),
      ["", "", "", "الإجمالي", spentInRange, invoicedInRange, balance],
    ];

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 26 }, { wch: 40 }];
    summarySheet["!views"] = [{ RTL: true } as any];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "ملخص المشروع");

    const ledgerSheet = XLSX.utils.aoa_to_sheet(ledgerRows);
    ledgerSheet["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 18 },
      { wch: 40 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];
    ledgerSheet["!views"] = [{ RTL: true } as any];
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, "كشف الحساب");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer as Buffer;
  }
}
