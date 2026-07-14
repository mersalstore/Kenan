import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string | null,
    action: "CREATE" | "UPDATE" | "DELETE",
    entityType: string,
    entityId: string,
    oldValue: any = null,
    newValue: any = null,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }
}
