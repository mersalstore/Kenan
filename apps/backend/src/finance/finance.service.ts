import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../shared";

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===== الفواتير (Invoices) =====
  async findInvoices() {
    return this.prisma.invoice.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInvoice(dto: CreateInvoiceDto, user: any) {
    const invoice = await this.prisma.invoice.create({
      data: {
        projectId: dto.projectId,
        number: dto.number,
        amount: dto.amount,
        status: dto.status || "PARTIAL",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
      },
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
