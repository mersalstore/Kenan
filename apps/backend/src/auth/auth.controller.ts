import { Controller, Get, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, GoogleLoginDto } from "../shared";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import type { Request, Response } from "express";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  const samesite = isProd ? "; SameSite=None" : "; SameSite=Lax";

  res.append(
    "Set-Cookie",
    `kanan_access_token=${encodeURIComponent(accessToken)}; HttpOnly; Path=/${samesite}; Max-Age=${15 * 60}${secure}`,
  );
  res.append(
    "Set-Cookie",
    `kanan_refresh_token=${encodeURIComponent(refreshToken)}; HttpOnly; Path=/${samesite}; Max-Age=${7 * 24 * 60 * 60}${secure}`,
  );
}

function clearAuthCookies(res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  const samesite = isProd ? "; SameSite=None" : "; SameSite=Lax";

  res.append("Set-Cookie", `kanan_access_token=; HttpOnly; Path=/${samesite}; Max-Age=0${secure}`);
  res.append("Set-Cookie", `kanan_refresh_token=; HttpOnly; Path=/${samesite}; Max-Age=0${secure}`);
}

function extractCookieToken(req: Request, name: string): string | undefined {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("config")
  async getConfig() {
    return {
      googleReady: !!(process.env.GOOGLE_CLIENT_ID || "304044976713-3mtnpi2vsr6ikrldgc1v4cnfit9ca74t.apps.googleusercontent.com"),
      clientId: process.env.GOOGLE_CLIENT_ID || "304044976713-3mtnpi2vsr6ikrldgc1v4cnfit9ca74t.apps.googleusercontent.com",
    };
  }

  @Post("login")
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("google")
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleLogin(dto);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body("refreshToken") bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = bodyToken || extractCookieToken(req, "kanan_refresh_token");
    if (!token) {
      clearAuthCookies(res);
      return this.authService.refresh("");
    }
    const result = await this.authService.refresh(token);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body("refreshToken") bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = bodyToken || extractCookieToken(req, "kanan_refresh_token");
    clearAuthCookies(res);
    if (token) {
      await this.authService.logout(token);
    }
    return { ok: true };
  }
}
