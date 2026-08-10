import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly records = new Map<string, RateLimitRecord>();
  private readonly maxAttempts: number = 5;
  private readonly windowMs: number = 5 * 60 * 1000; // 5 دقائق

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const ip =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (request.headers["x-real-ip"] as string)?.trim() ||
      request.ip ||
      request.socket?.remoteAddress ||
      "unknown";

    const email = request.body?.email ? String(request.body.email).toLowerCase().trim() : "";
    
    // مفتاح الحظر الرئيسي بناءً على عنوان الـ IP
    const ipKey = `rl_ip_${ip}`;
    const emailKey = email ? `rl_user_${ip}_${email}` : null;
    const now = Date.now();

    // فحص وتطبيق الزيادة للـ IP
    const ipRecord = this.checkAndIncrement(ipKey, now);
    if (emailKey) {
      this.checkAndIncrement(emailKey, now);
    }

    const remaining = Math.max(0, this.maxAttempts - ipRecord.count);
    const retryAfterSeconds = Math.ceil((ipRecord.resetTime - now) / 1000);

    if (response && typeof response.setHeader === "function") {
      response.setHeader("X-RateLimit-Limit", this.maxAttempts);
      response.setHeader("X-RateLimit-Remaining", remaining);
      response.setHeader("X-RateLimit-Reset", Math.ceil(ipRecord.resetTime / 1000));
    }

    if (ipRecord.count > this.maxAttempts) {
      const waitMinutes = Math.ceil(retryAfterSeconds / 60);
      if (response && typeof response.setHeader === "function") {
        response.setHeader("Retry-After", retryAfterSeconds);
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Too Many Requests",
          message: `تم حظر عنوان الـ IP الخاص بك (${ip}) مؤقتاً بسبب تجاوز عدد محاولات تسجيل الدخول المسموح بها (${this.maxAttempts} محاولات). يرجى الانتظار ${waitMinutes} دقيقة قبل المحاولة مجدداً.`,
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private checkAndIncrement(key: string, now: number): RateLimitRecord {
    let record = RateLimitGuard.records.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      RateLimitGuard.records.set(key, record);
    } else {
      record.count += 1;
    }
    return record;
  }

  public static resetAttempts(ip: string, email?: string) {
    RateLimitGuard.records.delete(`rl_ip_${ip}`);
    if (email) {
      RateLimitGuard.records.delete(`rl_user_${ip}_${email}`);
    }
  }
}

