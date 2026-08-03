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

  /**
   * فحص صحة السيرفر واتصال قاعدة البيانات.
   *
   * هذا المسار مفتوح بلا مصادقة، لذلك لا يُرجع شيئاً عن محتوى النظام:
   * لا عدد مستخدمين ولا اسم مضيف ولا حالة إعدادات. كانت هذه القيم موجودة
   * أثناء تشخيص أعطال الاتصال وأُزيلت بعد انتهائه.
   */
  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      // بلا نص الخطأ: رسائل Prisma تكشف المضيف والمنفذ واسم قاعدة البيانات
      return { status: 'degraded', database: 'unavailable' };
    }
  }
}
