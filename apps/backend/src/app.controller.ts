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

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected', configured, host };
    } catch (error) {
      return {
        status: 'degraded',
        configured,
        host,
        database: (error as Error).message,
      };
    }
  }
}
