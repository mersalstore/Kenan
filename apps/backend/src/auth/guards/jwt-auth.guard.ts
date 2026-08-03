import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtSecret } from "../jwt-secret";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("التوكين المعتمد غير موجود أو غير صالح");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret(),
      });
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException("التوكين منتهي الصلاحية أو غير صالح");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
