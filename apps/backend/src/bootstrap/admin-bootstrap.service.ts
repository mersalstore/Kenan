import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const defaultPasswordHash = await bcrypt.hash("123456", 10);

      const defaultUsers: Array<{ email: string; name: string; role: UserRole }> = [
        {
          email: "kenansafety.sec@gmail.com",
          name: "إدارة كنان للسلامة",
          role: UserRole.ADMIN,
        },
        {
          email: "engineer@kenan.com",
          name: "م. كريم عادل (مهندس الموقع)",
          role: UserRole.SITE_ENGINEER,
        },
        {
          email: "pm@kenan.com",
          name: "مدير المشاريع",
          role: UserRole.PROJECT_MANAGER,
        },
        {
          email: "procurement@kenan.com",
          name: "مسؤول المشتريات والمخازن",
          role: UserRole.PROCUREMENT,
        },
        {
          email: "accountant@kenan.com",
          name: "محاسب الشركة",
          role: UserRole.PROCUREMENT,
        },
      ];

      for (const u of defaultUsers) {
        const existing = await this.prisma.user.findUnique({ where: { email: u.email } });
        if (!existing) {
          await this.prisma.user.create({
            data: {
              name: u.name,
              email: u.email,
              passwordHash: defaultPasswordHash,
              role: u.role,
              isActive: true,
            },
          });
          this.logger.log(`تم إنشاء الحساب التمهيدي بنجاح: ${u.email} (${u.role})`);
        }
      }
    } catch (error) {
      this.logger.error("تعذّر إنشاء الحسابات التمهيدية: " + (error as Error).message);
    }
  }
}
