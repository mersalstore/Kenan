import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "apps", "backend", ".env") });

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

const adapter = new PrismaMariaDb(connectionOptions());
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding dailyReports role permissions...");

  const result = await prisma.rolePermission.createMany({
    data: [
      { role: UserRole.SITE_ENGINEER, module: "dailyReports", action: "READ" },
      { role: UserRole.SITE_ENGINEER, module: "dailyReports", action: "CREATE" },
      { role: UserRole.ADMIN, module: "dailyReports", action: "READ" },
      { role: UserRole.ADMIN, module: "dailyReports", action: "CREATE" },
    ],
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} new permission row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
