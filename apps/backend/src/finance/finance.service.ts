import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
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

/**
 * هل الخطأ سببه أن قاعدة البيانات أقدم من مخطط Prisma؟ يحدث حين تُضاف أعمدة
 * جديدة (أعمدة الفاتورة الضريبية مثلاً) دون تنفيذ `prisma db push` على السيرفر.
 * عندها يفشل الإدراج والقراءة معاً لأن Prisma يذكر كل أعمدة الموديل في الاستعلام.
 */
function isSchemaDriftError(error: any): boolean {
  const code = error?.code;
  if (code === "P2021" || code === "P2022") return true;
  const message = String(error?.message ?? "");
  return /Unknown column|doesn't exist|no such column|ER_BAD_FIELD_ERROR/i.test(message);
}

const SCHEMA_DRIFT_MESSAGE =
  "قاعدة البيانات على السيرفر أقدم من النظام (أعمدة الفاتورة الضريبية غير موجودة). " +
  "نفّذ مزامنة المخطط: npm run db:push داخل apps/backend.";

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===== الفواتير (Invoices) =====
  async findInvoices() {
    try {
      return await this.prisma.invoice.findMany({
        include: {
          project: true,
          client: true,
          items: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      this.logger.error(`findInvoices failed: ${(error as Error).message}`);
      if (!isSchemaDriftError(error)) {
        const code = (error as any)?.code;
        throw new InternalServerErrorException(
          `تعذر قراءة الفواتير${code ? ` (رمز الخطأ ${code})` : ""}. التفاصيل في سجل السيرفر.`,
        );
      }
      // جداول وأعمدة الفاتورة الضريبية تُضاف عبر prisma db push. حتى تُنفَّذ،
      // نُرجع الفواتير بشكلها المبسّط بدل تعطيل شاشة المالية بالكامل.
      return this.prisma.invoice.findMany({
        select: {
          id: true,
          projectId: true,
          number: true,
          amount: true,
          status: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
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

    // التحقق من صحة ووجود مشروع وعميل مطابقين في قاعدة البيانات لمنع أخطاء Foreign Key Constraint
    let projectId: string | null = null;
    if (dto.projectId && typeof dto.projectId === "string" && dto.projectId.trim() !== "" && dto.projectId !== "null" && dto.projectId !== "undefined") {
      const projExists = await this.prisma.project.findUnique({ where: { id: dto.projectId.trim() } });
      if (projExists) projectId = projExists.id;
    }

    let clientId: string | null = null;
    if (dto.clientId && typeof dto.clientId === "string" && dto.clientId.trim() !== "" && dto.clientId !== "null" && dto.clientId !== "undefined") {
      const clientExists = await this.prisma.client.findUnique({ where: { id: dto.clientId.trim() } });
      if (clientExists) clientId = clientExists.id;
    }

    const invNumber = (dto.number && dto.number.trim() !== "") ? dto.number.trim() : `INV-${Date.now().toString().slice(-6)}`;

    // الحقول المشتركة مع الشكل المبسّط للفاتورة
    const base = {
      projectId,
      number: invNumber,
      // مع وجود بنود يكون الإجمالي محسوباً؛ وبدونها نحترم المبلغ المُدخل
      amount: hasItems ? total : dto.amount,
      status: (dto.status || "PARTIAL") as any,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
    };

    // رقم الفاتورة فريد في القاعدة. رفض العملية برسالة غامضة ("Internal server
    // error") هو ما كان يحدث سابقاً، فنكشف التعارض قبل الإدراج.
    const duplicate = await this.prisma.invoice.findUnique({
      where: { number: invNumber },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(`رقم الفاتورة ${invNumber} مستخدم من قبل. اختر رقماً آخر.`);
    }

    let invoice;
    try {
      invoice = await this.prisma.invoice.create({
        data: {
          ...base,
          clientId,
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
    } catch (error) {
      this.logger.error(`createInvoice failed: ${(error as Error).message}`);
      const code = (error as any)?.code;
      if (code === "P2002") {
        throw new ConflictException(`رقم الفاتورة ${invNumber} مستخدم من قبل. اختر رقماً آخر.`);
      }
      if (code === "P2003") {
        throw new BadRequestException("المشروع أو العميل المرتبط بالفاتورة غير موجود.");
      }
      if (!isSchemaDriftError(error)) {
        // رسالة Prisma قد تكشف مضيف قاعدة البيانات، فنكتفي برمز الخطأ للمستخدم
        throw new InternalServerErrorException(
          `تعذر حفظ الفاتورة${code ? ` (رمز الخطأ ${code})` : ""}. التفاصيل في سجل السيرفر.`,
        );
      }

      // أعمدة الفاتورة الضريبية تُضاف عبر prisma db push. حتى تُنفَّذ، نحفظ
      // الفاتورة بشكلها المبسّط بدل رفض العملية على المستخدم. لا نستخدم include
      // هنا لأن Prisma عندها يقرأ الأعمدة الناقصة نفسها فيفشل الحفظ مرة أخرى.
      try {
        invoice = await this.prisma.invoice.create({
          data: base,
          select: {
            id: true,
            projectId: true,
            number: true,
            amount: true,
            status: true,
            dueDate: true,
            paidAt: true,
            createdAt: true,
          },
        });
      } catch (fallbackError) {
        this.logger.error(`createInvoice fallback failed: ${(fallbackError as Error).message}`);
        throw new InternalServerErrorException(SCHEMA_DRIFT_MESSAGE);
      }
    }

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
    let projectId: string | null = null;
    if (dto.projectId && typeof dto.projectId === "string" && dto.projectId.trim() !== "" && dto.projectId !== "null" && dto.projectId !== "undefined") {
      const projExists = await this.prisma.project.findUnique({ where: { id: dto.projectId.trim() } });
      if (projExists) projectId = projExists.id;
    }

    const expense = await this.prisma.expense.create({
      data: {
        projectId,
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
