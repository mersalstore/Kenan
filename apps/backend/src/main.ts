import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "../.env") });
dotenv.config({ path: path.join(process.cwd(), "../../.env") });

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

const server = express();

export const createServer = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  return server;
};

// Local development server listener
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    const port = process.env.PORT ?? 8787;
    await app.listen(port);
    console.log(`Kanan NestJS Backend running on port ${port}`);
  };
  bootstrap();
}

// For Vercel Serverless Function
export default async (req: any, res: any) => {
  try {
    await createServer();
    return server(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Boot Error:", error);
    if (res && typeof res.status === "function") {
      res.status(500).json({
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } else {
      throw error;
    }
  }
};
