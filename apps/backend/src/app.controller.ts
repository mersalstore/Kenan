import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // فحص صحة السيرفر + اتصال قاعدة البيانات
  @Get('health')
  async health() {
    // هل وصل ملف الإعدادات للسيرفر أصلاً؟ (بدون كشف أي بيانات اعتماد)
    const configured = Boolean(process.env.DATABASE_URL);
    let host = 'unset';
    try {
      host = new URL(process.env.DATABASE_URL ?? '').hostname;
    } catch {}

    // هل وصلت متغيرات تهيئة المدير الأول؟ (قيم منطقية فقط، لا كلمات مرور)
    const bootstrap = {
      emailSet: Boolean(process.env.BOOTSTRAP_ADMIN_EMAIL),
      passwordSet: Boolean(process.env.BOOTSTRAP_ADMIN_PASSWORD),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const users = await this.prisma.user.count();
      // يميّز حساب أنشأته خدمة التهيئة عن حساب أنشأه دخول Google، دون كشف
      // أي بريد أو اسم — الفرق يحدد ما إذا كانت هناك كلمة مرور معروفة أصلاً.
      const seeded = process.env.BOOTSTRAP_ADMIN_NAME
        ? (await this.prisma.user.count({
            where: { name: process.env.BOOTSTRAP_ADMIN_NAME },
          })) > 0
        : false;
      return {
        status: 'ok',
        database: 'connected',
        configured,
        host,
        users,
        bootstrap: { ...bootstrap, seeded },
      };
    } catch (error) {
      return {
        status: 'degraded',
        configured,
        host,
        bootstrap,
        database: (error as Error).message,
      };
    }
  }
}
