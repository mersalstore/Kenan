import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../shared";

/** تقريب لخانتين عشريتين — المبالغ الضريبية لا تحتمل فروق الفاصلة العائمة */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===== الفواتير (Invoices) =====
  async findInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        project: true,
        client: true,
        items: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInvoice(dto: CreateInvoiceDto, user: any) {
    // الضريبة تُحسب على السيرفر ولا تُؤخذ كما أرسلتها الشاشة: الفاتورة مستند
    // ضريبي، ولا يصح أن يعتمد وعاؤها على قيمة قابلة للتعديل من المتصفح.
    const items = dto.items ?? [];
    const hasItems = items.length > 0;

    const subtotal = hasItems
      ? items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
      : (dto.subtotal ?? dto.amount);

    const vatPercent = dto.vatPercent ?? 15;
    const vatAmount = round2((subtotal * vatPercent) / 100);
    const total = round2(subtotal + vatAmount);

    const invoice = await this.prisma.invoice.create({
      data: {
        projectId: dto.projectId,
        number: dto.number,
        // مع وجود بنود يكون الإجمالي محسوباً؛ وبدونها نحترم المبلغ المُدخل
        amount: hasItems ? total : dto.amount,
        status: dto.status || "PARTIAL",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
        clientId: dto.clientId || null,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        subtotal: round2(subtotal),
        vatPercent,
        vatAmount,
        notes: dto.notes,
        items: hasItems
          ? {
              create: items.map((it, index) => ({
                description: it.description,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                total: round2(it.quantity * it.unitPrice),
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { sortOrder: "asc" } }, client: true, project: true },
    });

    await this.auditService.log(user.sub, "CREATE", "Invoice", invoice.id, null, invoice);
    return invoice;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto, user: any) {
    const oldInvoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!oldInvoice) throw new NotFoundException("الفاتورة غير موجودة");

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        projectId: dto.projectId ?? undefined,
        number: dto.number ?? undefined,
        amount: dto.amount ?? undefined,
        status: dto.status ?? undefined,
        dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
        paidAt: dto.paidAt !== undefined ? (dto.paidAt ? new Date(dto.paidAt) : null) : undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "Invoice", id, oldInvoice, updated);
    return updated;
  }

  async deleteInvoice(id: string, user: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException("الفاتورة غير موجودة");

    await this.prisma.invoice.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Invoice", id, invoice, null);
    return { ok: true };
  }

  // ===== المصاريف (Expenses) =====
  async findExpenses() {
    return this.prisma.expense.findMany({
      include: { project: true },
      orderBy: { date: "desc" },
    });
  }

  async createExpense(dto: CreateExpenseDto, user: any) {
    const expense = await this.prisma.expense.create({
      data: {
        projectId: dto.projectId || null,
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
    await this.auditService.log(user.sub, "CREATE", "Expense", expense.id, null, expense);
    return expense;
  }

  async updateExpense(id: string, dto: UpdateExpenseDto, user: any) {
    const oldExpense = await this.prisma.expense.findUnique({ where: { id } });
    if (!oldExpense) throw new NotFoundException("المصروف غير موجود");

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        projectId: dto.projectId !== undefined ? dto.projectId : undefined,
        type: dto.type ?? undefined,
        amount: dto.amount ?? undefined,
        description: dto.description ?? undefined,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "Expense", id, oldExpense, updated);
    return updated;
  }

  async deleteExpense(id: string, user: any) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException("المصروف غير موجود");

    await this.prisma.expense.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Expense", id, expense, null);
    return { ok: true };
  }
}
