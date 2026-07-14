import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateInventoryItemDto, UpdateInventoryItemDto, IssueInventoryDto, ImportInventoryDto } from "../shared";
import * as XLSX from "xlsx";

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { createdAt: "asc" } });
  }

  async create(dto: CreateInventoryItemDto, user: any) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        brand: dto.brand,
        quantity: dto.quantity ?? 0,
        unit: dto.unit || "قطعة",
        purchasePrice: dto.purchasePrice ?? 0,
        salePrice: dto.salePrice ?? 0,
        supplier: dto.supplier,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
        minQuantity: dto.minQuantity ?? 0,
      },
    });

    await this.auditService.log(user.sub, "CREATE", "InventoryItem", item.id, null, item);
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto, user: any) {
    const oldItem = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!oldItem) {
      throw new NotFoundException("الصنف غير موجود بالمخزن");
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        brand: dto.brand ?? undefined,
        quantity: dto.quantity ?? undefined,
        unit: dto.unit ?? undefined,
        purchasePrice: dto.purchasePrice ?? undefined,
        salePrice: dto.salePrice ?? undefined,
        supplier: dto.supplier ?? undefined,
        minQuantity: dto.minQuantity ?? undefined,
      },
    });

    await this.auditService.log(user.sub, "UPDATE", "InventoryItem", id, oldItem, updated);
    return updated;
  }

  async delete(id: string, user: any) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException("الصنف غير موجود بالمخزن");
    }

    await this.prisma.inventoryItem.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "InventoryItem", id, item, null);
    return { ok: true };
  }

  // صرف خامات لمشروع: خصم من المخزن + تسجيل في مواد المشروع
  async issue(id: string, dto: IssueInventoryDto, user: any) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException("الصنف غير موجود بالمخزن");
    }
    if (Number(item.quantity) < dto.quantity) {
      throw new BadRequestException("الكمية المطلوبة أكبر من المتاح بالمخزن");
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id },
        data: { quantity: { decrement: dto.quantity } },
      }),
      this.prisma.projectMaterial.create({
        data: {
          projectId: dto.projectId,
          itemId: id,
          name: item.name,
          unit: item.unit,
          qty: dto.quantity,
          unitPrice: item.purchasePrice,
        },
      }),
    ]);

    await this.auditService.log(user.sub, "UPDATE", "InventoryItem", id, item, updated);
    return updated;
  }

  // استيراد جماعي (من Excel/CSV في الواجهة)
  async bulkImport(dto: ImportInventoryDto, user: any) {
    const result = await this.prisma.inventoryItem.createMany({
      data: dto.items.map((it) => ({
        name: it.name,
        brand: it.brand,
        quantity: it.quantity ?? 0,
        unit: it.unit || "قطعة",
        purchasePrice: it.purchasePrice ?? 0,
        salePrice: it.salePrice ?? 0,
        supplier: it.supplier,
        receivedAt: it.receivedAt ? new Date(it.receivedAt) : new Date(),
        minQuantity: it.minQuantity ?? 0,
      })),
    });

    await this.auditService.log(user.sub, "CREATE", "InventoryItem", "bulk-import", null, { count: result.count });
    return { imported: result.count };
  }

  // تصدير المخزن كامل Excel
  async exportExcel(): Promise<Buffer> {
    const items = await this.findAll();
    const rows = items.map((it) => ({
      "الاسم": it.name,
      "الماركة": it.brand || "",
      "الكمية": Number(it.quantity),
      "الوحدة": it.unit,
      "سعر الشراء": Number(it.purchasePrice),
      "سعر البيع": Number(it.salePrice),
      "المورد": it.supplier || "",
      "تاريخ الاستلام": it.receivedAt ? it.receivedAt.toISOString().slice(0, 10) : "",
      "الحد الأدنى": Number(it.minQuantity),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "المخزن");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }
}
