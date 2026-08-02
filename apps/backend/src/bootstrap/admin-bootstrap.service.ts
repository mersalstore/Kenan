import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

/**
 * ينشئ حساب المدير الأول عند أول تشغيل على قاعدة بيانات فارغة.
 *
 * الشرط الصارم: لا يعمل إطلاقاً إن كان في الجدول أي مستخدم. بذلك لا يمكنه
 * تجاوز حساب قائم أو إعادة ضبط كلمة مرور، حتى لو بقيت المتغيرات في الإعدادات.
 * بعد الدخول أول مرة، غيّر كلمة المرور واحذف BOOTSTRAP_ADMIN_PASSWORD.
 */
@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email || !password) return;

    try {
      // قاعدة بيانات غير جاهزة أو غير متصلة يجب ألا تُسقط السيرفر كله
      const existing = await this.prisma.user.count();
      if (existing > 0) return;

      await this.prisma.user.create({
        data: {
          name: process.env.BOOTSTRAP_ADMIN_NAME || "مدير النظام",
          email,
          passwordHash: await bcrypt.hash(password, 10),
          role: "ADMIN",
          isActive: true,
        },
      });

      this.logger.warn(
        `تم إنشاء حساب المدير الأولي (${email}). غيّر كلمة المرور فوراً من شاشة إدارة المستخدمين.`,
      );
    } catch (error) {
      this.logger.error(
        "تعذّر إنشاء حساب المدير الأولي: " + (error as Error).message,
      );
    }
  }
}
