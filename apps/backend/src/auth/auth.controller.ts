import { Controller, Get, Post, Body, HttpCode, HttpStatus, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, GoogleLoginDto } from "../shared";

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
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("google")
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body("refreshToken") token: string) {
    return this.authService.refresh(token);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body("refreshToken") token: string) {
    return this.authService.logout(token);
  }
}
