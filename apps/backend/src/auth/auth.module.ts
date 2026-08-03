import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { jwtSecret } from "./jwt-secret";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      // registerAsync لأن register تُقيَّم عند تحميل الوحدة، وقد يسبق ذلك
      // قراءة ملف البيئة فيفشل التحقق من المفتاح بلا سبب حقيقي.
      useFactory: () => ({
        secret: jwtSecret(),
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
