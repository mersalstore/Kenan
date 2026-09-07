import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { loadEnv } from "../config/load-env";

loadEnv();

/**
 * يحوّل DATABASE_URL (mysql://user:pass@host:port/db) إلى إعدادات اتصال
 * المحوّل. كلمة المرور تكون URL-encoded داخل الرابط لذلك نفكّ ترميزها هنا.
 */
import * as fs from "fs";

function connectionOptions() {
  const rawUrl =
    process.env.DATABASE_URL ||
    "mysql://u463801179_kanan_user:8dREB5qR7wmrWTiL@localhost:3306/u463801179_kanan_db";
  const url = new URL(rawUrl);

  const socketCandidates = [
    process.env.MYSQL_SOCKET,
    "/var/lib/mysql/mysql.sock",
    "/tmp/mysql.sock",
    "/var/run/mysqld/mysqld.sock",
  ].filter((p): p is string => Boolean(p && fs.existsSync(p)));

  const socketPath = socketCandidates[0];

  return {
    host: socketPath ? undefined : (url.hostname || "localhost"),
    port: socketPath ? undefined : (url.port ? Number(url.port) : 3306),
    socketPath: socketPath,
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
