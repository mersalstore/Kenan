import { loadEnv } from "./config/load-env";
loadEnv();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend on kenan4saftey.com + all subdomains & localhost dev
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT ?? 8787;
  await app.listen(port, "0.0.0.0");
  console.log(`✅ Kanan Backend running on port ${port}`);
}

bootstrap();
