import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { loadEnv } from "../config/load-env";

loadEnv();

/**
 * يحوّل DATABASE_URL (mysql://user:pass@host:port/db) إلى إعدادات اتصال
 * المحوّل. كلمة المرور تكون URL-encoded داخل الرابط لذلك نفكّ ترميزها هنا.
 */
function connectionOptions() {
  const url = new URL(
    process.env.DATABASE_URL ??
      "mysql://root@localhost:3306/kanan",
  );

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    connectTimeout: 10_000,
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb(connectionOptions());
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
