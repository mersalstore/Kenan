import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
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
